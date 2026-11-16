import { expect, type Locator, type Page } from '@playwright/test';
import { HomePage } from './HomePage';
import { product } from '../data/shopping_cart.data';

/** "74.99€" / "€ 25.00 VAT incl." -> 74.99 */
export const parsePrice = (text: string): number => {
  const match = text.replace(/\s/g, '').match(/\d+(?:[.,]\d+)?/);
  if (!match) throw new Error(`No price found in "${text}"`);
  return parseFloat(match[0].replace(',', '.'));
};

/** Product page (WooCommerce single product). */
export class ProductPage {
  readonly page: Page;
  readonly title: Locator;
  readonly quantity: Locator;
  readonly addToCart: Locator;
  readonly options: Locator;
  readonly message: Locator;
  readonly viewCart: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1.product_title, h1').first();
    this.quantity = page.locator('form.cart input.qty');
    // The button label is translated by GTranslate, the name attribute is not.
    this.addToCart = page.locator('form.cart button[name="add-to-cart"]');
    this.options = page.locator('form.variations_form select');
    this.message = page.locator('.woocommerce-message');
    this.viewCart = this.message.locator('a.wc-forward');
  }

  /** Pick the first real option of every variation select (only for products that have options). */
  async chooseOptionsIfAny() {
    const count = await this.options.count();
    for (let i = 0; i < count; i++) {
      const select = this.options.nth(i);
      const value = await select.locator('option:not([value=""])').first().getAttribute('value');
      await select.selectOption(value!);
    }
  }

  async setQuantity(qty: number) {
    await this.quantity.fill(String(qty));
  }

  async add(qty: number) {
    await this.chooseOptionsIfAny();
    await this.setQuantity(qty);
    await this.addToCart.click();
  }
}

/** Shopping cart page. */
export class CartPage {
  readonly page: Page;
  readonly row: Locator;
  readonly productLink: Locator;
  readonly price: Locator;
  readonly quantity: Locator;
  readonly subtotal: Locator;
  readonly updateCart: Locator;
  readonly promoInput: Locator;
  readonly applyPromo: Locator;
  readonly notice: Locator;
  readonly totalsSubtotal: Locator;
  readonly shipping: Locator;
  readonly total: Locator;
  readonly proceedToCheckout: Locator;

  constructor(page: Page) {
    this.page = page;
    this.proceedToCheckout = page.locator('a.checkout-button');
    this.row = page.locator('tr.woocommerce-cart-form__cart-item').filter({ has: page.locator(`td.product-name a`, { hasText: product.name }) });
    this.productLink = this.row.locator('td.product-name a');
    this.price = this.row.locator('td.product-price');
    this.quantity = this.row.locator('input.qty');
    this.subtotal = this.row.locator('td.product-subtotal');
    this.updateCart = page.locator('button[name="update_cart"]');
    this.promoInput = page.locator('#coupon_code');
    this.applyPromo = page.locator('button[name="apply_coupon"]');
    // WooCommerce renders messages as siblings of the notices wrapper, so locate them by their own classes.
    this.notice = page.locator('.woocommerce-message, .woocommerce-error');

    const totals = page.locator('.cart_totals');
    this.totalsSubtotal = totals.locator('tr.cart-subtotal .amount').first();
    // Amount of the currently selected shipping method.
    this.shipping = totals.locator('input.shipping_method:checked + label .amount');
    this.total = totals.locator('tr.order-total .amount').first();
  }

  async setQuantityAndUpdate(qty: number) {
    await this.quantity.fill(String(qty));
    await this.updateCart.click();
    await expect(this.notice).toContainText('Cart updated.');
    await expect(this.quantity).toHaveValue(String(qty));
  }

  async applyPromoCode(code: string) {
    await this.promoInput.fill(code);
    await this.applyPromo.click();
  }

  async amount(locator: Locator): Promise<number> {
    return parsePrice(await locator.innerText());
  }
}

/**
 * Cookies accepted + English set (as in homepage.spec.ts), then Piercing > Tremun Piercing >
 * Attachments from the top menu, and the first product of the list is opened.
 */
export async function openFirstAttachment(page: Page, home: HomePage) {
  await home.open();
  await home.menuLink(product.piercingHref).hover();
  await home.menuLink(product.tremunHref).click();
  await expect(page).toHaveURL(new RegExp(`${product.tremunHref}$`));
  // The "Attachments" sub-category is in the hover sub-menu of Tremun Piercing.
  await home.menuLink(product.piercingHref).hover();
  await home.menuLink(product.tremunHref).hover();
  await home.menuLink(product.attachmentsHref).click();
  await expect(page).toHaveURL(new RegExp(`${product.attachmentsHref}$`));
  await page.locator('ul.products li.product a.woocommerce-LoopProduct-link').first().click();
}
