import { expect, type Locator, type Page } from '@playwright/test';
import { HomePage } from './HomePage';
import { CartPage, ProductPage, parsePrice } from './CartPage';
import { product } from '../data/shopping_cart.data';

/** Checkout page (WooCommerce). */
export class CheckoutPage {
  readonly page: Page;
  readonly title: Locator;

  // Order review
  readonly orderRow: Locator;
  readonly subtotal: Locator;
  readonly total: Locator;

  // Promo code
  readonly showPromo: Locator;
  readonly promoInput: Locator;
  readonly applyPromo: Locator;
  readonly promoError: Locator;

  // Payment / place order
  readonly placeOrder: Locator;
  readonly errors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('section.module-cart-top h1');

    this.orderRow = page.locator('#order_review tr.cart_item');
    this.subtotal = page.locator('#order_review tr.cart-subtotal .amount').first();
    this.total = page.locator('#order_review tr.order-total .amount').first();

    this.showPromo = page.locator('a.showcoupon');
    // The page also contains a hidden copy of the coupon form, so scope to the visible one.
    const couponForm = page.locator('#shop-isle-checkout-coupon form.checkout_coupon');
    this.promoInput = couponForm.locator('input[name="coupon_code"]');
    this.applyPromo = couponForm.locator('button[name="apply_coupon"]');
    this.promoError = page.locator('.coupon-error-notice');

    this.placeOrder = page.locator('#place_order');
    this.errors = page.locator('.woocommerce-NoticeGroup-checkout .woocommerce-error li');
  }

  /** The 3 "reseller" buttons above the form, located by their authored href. */
  topButton(href: string): Locator {
    return this.page.locator(`a.elementor-button[href$="${href}"]`);
  }

  /** Label of a billing field (`for` = field id). */
  label(fieldId: string): Locator {
    return this.page.locator(`form.checkout label[for="${fieldId}"]`);
  }

  sectionTitle(text: string): Locator {
    return this.page.locator('form.checkout h3, form.checkout h2, #order_review_heading').filter({ hasText: text });
  }

  shippingRadio(id: string): Locator {
    return this.page.locator(`#${id}`);
  }

  /** Fee of the selected shipping method (0 for free pick-up options, which have no price). */
  async shippingFee(): Promise<number> {
    const amount = this.page.locator('#order_review input.shipping_method:checked + label .amount');
    return (await amount.count()) ? parsePrice(await amount.first().innerText()) : 0;
  }

  async amount(locator: Locator): Promise<number> {
    return parsePrice(await locator.innerText());
  }

  paymentLabel(value: string): Locator {
    return this.page.locator(`label[for="payment_method_${value}"]`);
  }

  async choosePayment(value: string) {
    await this.paymentLabel(value).click();
    await expect(this.page.locator(`#payment_method_${value}`)).toBeChecked();
  }

  /**
   * GTranslate sometimes leaves a batch of strings untranslated (a flaky translation request) and a
   * reload triggers a new one. Retry the assertion with a reload in between, so only labels that
   * stay untranslated fail the test.
   */
  async expectWithReload(assertion: () => Promise<void>, timeout = 70_000) {
    await expect(async () => {
      try {
        await assertion();
      } catch (error) {
        await this.page.reload();
        throw error;
      }
    }).toPass({ timeout });
  }

  async applyPromoCode(code: string) {
    await this.showPromo.click();
    await this.promoInput.fill(code);
    await this.applyPromo.click();
  }
}

/**
 * Same flow as shopping_cart.spec.ts: cookies + English, product added to the cart by URL,
 * then "Proceed with the order" on the cart page.
 */
export async function openCheckoutWithProduct(page: Page, qty: number) {
  await new HomePage(page).open();
  await page.goto(product.path);
  const productPage = new ProductPage(page);
  await productPage.add(qty);
  await productPage.viewCart.click();
  const cart = new CartPage(page);
  await expect(cart.quantity).toHaveValue(String(qty));
  await cart.proceedToCheckout.click();
  return new CheckoutPage(page);
}
