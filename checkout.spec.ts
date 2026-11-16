import { test, expect } from '@playwright/test';
import { currentPath } from './pages/HomePage';
import { CheckoutPage, openCheckoutWithProduct } from './pages/CheckoutPage';
import { cart, product } from './data/shopping_cart.data';
import {
  checkoutPage, fieldLabels, paymentMethods, placeOrderButton, promo, requiredMessages, sectionTitles, shipping, topButtons,
} from './data/checkout.data';

// Checkout checks. Nothing is ordered: the only "Place order" click is made with all fields empty.
// Every test starts like shopping_cart.spec.ts (cookies, English, product x2 in the cart) and then
// presses "Proceed with the order".
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} should be ~${expected}`).toBeLessThanOrEqual(cart.priceTolerance);

const productTotal = product.unitPrice * checkoutPage.qty;

test.describe('Checkout', () => {
  let checkout: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    checkout = await openCheckoutWithProduct(page, checkoutPage.qty);
  });

  test('checkout page opens with its title and the 3 top buttons lead to the right pages', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(`${checkoutPage.path}$`));
    await expect(checkout.title).toHaveText(checkoutPage.title, { ignoreCase: true });

    for (const button of topButtons) {
      await expect(checkout.topButton(button.href)).toHaveText(button.label, { ignoreCase: true });
      // The buttons open in a new tab.
      const [popup] = await Promise.all([page.waitForEvent('popup'), checkout.topButton(button.href).click()]);
      await expect.poll(() => currentPath(popup), { message: `"${button.label}" should open ${button.expectedPath}` }).toBe(button.expectedPath);
      await popup.close();
    }
    expect(currentPath(page)).toBe(checkoutPage.path);
  });

  test('order review shows the product and total = product price + delivery', async () => {
    await expect(checkout.orderRow).toHaveCount(1);
    await expect(checkout.orderRow).toContainText(product.name);
    await expect(checkout.orderRow).toContainText(`× ${checkoutPage.qty}`);

    near(await checkout.amount(checkout.subtotal), productTotal);
    const delivery = await checkout.shippingFee();
    expect(delivery).toBeCloseTo(shipping.express.fee, 2);
    near(await checkout.amount(checkout.total), productTotal + delivery);
  });

  test('billing form labels and section titles are in English', async () => {
    test.setTimeout(100_000);
    const quick = expect.configure({ timeout: 4_000 });
    await checkout.expectWithReload(async () => {
      for (const title of sectionTitles) {
        await quick(checkout.sectionTitle(title).first(), `section "${title}"`).toBeVisible();
      }
      for (const [id, text] of Object.entries(fieldLabels)) {
        await quick(checkout.label(id), `label of ${id}`).toHaveText(new RegExp(`^\\s*${text}(\\W|$)`));
      }
    });
  });

  test('invalid promo code shows a validation message', async () => {
    await checkout.applyPromoCode(promo.code);
    await expect(checkout.promoError).toHaveText(promo.invalidMessage);
    // Nothing was discounted.
    near(await checkout.amount(checkout.subtotal), productTotal);
  });

  test('changing the shipping method updates the total', async () => {
    for (const method of [shipping.cashOnDelivery, shipping.pickupMonza, shipping.express]) {
      await checkout.shippingRadio(method.id).check();
      await expect
        .poll(async () => Math.abs((await checkout.amount(checkout.total)) - (productTotal + method.fee)), { message: `total with ${method.id}` })
        .toBeLessThanOrEqual(cart.priceTolerance);
      expect(await checkout.shippingFee()).toBeCloseTo(method.fee, 2);
    }
  });

  // KNOWN SITE DEFECT: the PayPal / credit card method name ("Carta di Credito o conto Paypal") is
  // not translated. test.fail() turns red once it is fixed (then remove test.fail()).
  test('payment methods are named in English', async () => {
    test.fail(true, 'PayPal payment method is still shown in Italian: "Carta di Credito o conto Paypal"');
    for (const method of paymentMethods) {
      await expect(checkout.paymentLabel(method.value), `payment method ${method.value}`).toHaveText(method.label);
    }
  });

  // KNOWN SITE DEFECT: the button label is Italian ("Effettua ordine" / "Effettua Pagamento").
  test('"Place order" button is in English after changing the payment method', async () => {
    test.fail(true, 'Place order button is shown in Italian ("Effettua ordine" / "Effettua pagamento")');
    for (const value of ['ppcp', 'cheque']) {
      await checkout.choosePayment(value);
      await expect(checkout.placeOrder, `button for ${value}`).toHaveText(placeOrderButton);
    }
  });

  // KNOWN SITE DEFECT: the server-side validation messages are in Italian.
  test('placing an order with empty fields shows the required-field messages in English', async () => {
    test.fail(true, 'Validation messages are shown in Italian ("Nome di fatturazione è un campo obbligatorio.")');
    await checkout.placeOrder.click();
    await expect(checkout.errors).toHaveText(requiredMessages);
  });
});
