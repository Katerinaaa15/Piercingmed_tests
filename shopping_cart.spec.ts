import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { CartPage, ProductPage, openFirstAttachment } from './pages/CartPage';
import { cart, product, promo } from './data/shopping_cart.data';

// Add-to-cart and shopping cart tests. Every test starts by accepting cookies and switching to
// English (HomePage.open()). Test 1 reaches the product through the top menu; the others add the
// product directly by URL to stay quick.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} should be ~${expected}`).toBeLessThanOrEqual(cart.priceTolerance);

test.describe('Shopping cart', () => {
  test('add the first Tremun attachment (x2) to the cart and see it in the cart', async ({ page }) => {
    const home = new HomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    await openFirstAttachment(page, home);
    await expect(productPage.title).toHaveText(product.name);

    await productPage.add(cart.initialQty);
    // WooCommerce prefixes the quantity when it is more than 1.
    await expect(productPage.message).toContainText(`${cart.initialQty} × “${product.name}” have been added to your cart.`);

    await productPage.viewCart.click();
    await expect(page).toHaveURL(new RegExp(`${cart.path}$`));
    await expect(cartPage.productLink).toHaveText(product.name);
    await expect(cartPage.quantity).toHaveValue(String(cart.initialQty));
    near(await cartPage.amount(cartPage.price), product.unitPrice);
    near(await cartPage.amount(cartPage.subtotal), product.unitPrice * cart.initialQty);
  });

  test.describe('with the product in the cart', () => {
    let cartPage: CartPage;

    test.beforeEach(async ({ page }) => {
      await new HomePage(page).open();
      await page.goto(product.path);
      const productPage = new ProductPage(page);
      await productPage.add(cart.initialQty);
      await productPage.viewCart.click();
      cartPage = new CartPage(page);
      await expect(cartPage.quantity).toHaveValue(String(cart.initialQty));
    });

    test('update cart: quantity +1 then -1 recalculates the totals', async () => {
      const up = cart.initialQty + 1;
      await cartPage.setQuantityAndUpdate(up);
      near(await cartPage.amount(cartPage.subtotal), product.unitPrice * up);
      near(await cartPage.amount(cartPage.totalsSubtotal), product.unitPrice * up);
      near(await cartPage.amount(cartPage.total), (await cartPage.amount(cartPage.totalsSubtotal)) + (await cartPage.amount(cartPage.shipping)));

      await cartPage.setQuantityAndUpdate(cart.initialQty);
      near(await cartPage.amount(cartPage.subtotal), product.unitPrice * cart.initialQty);
      near(await cartPage.amount(cartPage.totalsSubtotal), product.unitPrice * cart.initialQty);
    });

    test('invalid promo code is rejected and cart total = subtotal + delivery', async () => {
      await cartPage.applyPromoCode(promo.code);
      await expect(cartPage.notice).toContainText(promo.invalidMessage);

      // Nothing is discounted, the total includes the selected delivery method.
      const subtotal = await cartPage.amount(cartPage.totalsSubtotal);
      const delivery = await cartPage.amount(cartPage.shipping);
      expect(delivery).toBeGreaterThan(0);
      near(subtotal, product.unitPrice * cart.initialQty);
      near(await cartPage.amount(cartPage.total), subtotal + delivery);
    });
  });
});
