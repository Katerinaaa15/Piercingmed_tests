import { expect, type Locator, type Page } from '@playwright/test';
import { HomePage } from './HomePage';
import { parsePrice } from './CartPage';
import { category } from '../data/shop_product_page.data';

/** Product category (shop) page with the price filter. */
export class ShopPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cards: Locator;

  // Price filter widget (WooCommerce jQuery UI slider)
  readonly minHandle: Locator;
  readonly maxHandle: Locator;
  readonly minValue: Locator;
  readonly maxValue: Locator;
  readonly filterButton: Locator;
  readonly priceLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1').first();
    this.cards = page.locator('ul.products li.product');

    const filter = page.locator('.widget_price_filter');
    this.minHandle = filter.locator('.ui-slider-handle').first();
    this.maxHandle = filter.locator('.ui-slider-handle').last();
    // The real inputs are hidden; they hold the slider values.
    this.minValue = filter.locator('#min_price');
    this.maxValue = filter.locator('#max_price');
    this.filterButton = filter.locator('button[type="submit"]');
    this.priceLabel = filter.locator('.price_label');
  }

  /** Piercing > Tremun Gold, like a visitor would do it from the top menu. */
  async openFromMenu(home: HomePage) {
    await home.menuLink(category.parentHref).hover();
    await home.menuLink(category.href).click();
    await expect(this.page).toHaveURL(new RegExp(`${category.href}$`));
  }

  /** Move a slider handle with the keyboard (one step per key press) until the hidden input has `target`. */
  private async moveHandle(handle: Locator, input: Locator, target: number) {
    await handle.focus();
    for (let i = 0; i < 100; i++) {
      const current = Number(await input.inputValue());
      if (current === target) return;
      await handle.press(current > target ? 'ArrowLeft' : 'ArrowRight');
    }
    throw new Error(`Could not move the price slider to ${target}`);
  }

  async setPriceRange(min: number, max: number) {
    await this.moveHandle(this.maxHandle, this.maxValue, max);
    await this.moveHandle(this.minHandle, this.minValue, min);
    await this.filterButton.click();
    await expect(this.page).toHaveURL(new RegExp(`min_price=${min}&max_price=${max}`));
  }

  /** Every price shown on every product card of the page (both ends of a price range). */
  async allPrices(): Promise<{ product: string; price: number }[]> {
    const prices: { product: string; price: number }[] = [];
    for (let i = 0; i < (await this.cards.count()); i++) {
      const card = this.cards.nth(i);
      const product = await card.locator('.woocommerce-loop-product__title').innerText();
      for (const amount of await card.locator('.price .amount').allInnerTexts()) {
        prices.push({ product, price: parsePrice(amount) });
      }
    }
    return prices;
  }

  /** First product that has the "You choose" (select options) button, i.e. a product with options. */
  firstProductWithOptions(): Locator {
    return this.cards.filter({ has: this.page.locator('a.product_type_variable') }).first();
  }

  async productName(card: Locator): Promise<string> {
    return (await card.locator('.woocommerce-loop-product__title').innerText()).trim();
  }

  /** Open a product by clicking the product itself (the "You choose" / "Add to cart" button is not used). */
  async openProduct(card: Locator) {
    await card.locator('a.woocommerce-LoopProduct-link').click();
  }
}

/** Product page of a product with options (variation swatches) and the info tabs. */
export class ProductDetailPage {
  readonly page: Page;
  readonly title: Locator;
  readonly swatches: Locator;
  readonly measure: Locator;
  readonly tabLinks: Locator;
  readonly related: Locator;
  readonly relatedTitle: Locator;
  readonly relatedProducts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1').first();
    this.swatches = page.locator('table.variations li[data-value]');
    // Attribute label cell ("Measure", "Gauge", ... depending on the product); the selected option is appended to it as ": <option>".
    this.measure = page.locator('table.variations th.label');
    this.tabLinks = page.locator('.woocommerce-tabs ul.tabs a');
    this.related = page.locator('section.related');
    this.relatedTitle = this.related.locator('h2:not(.woocommerce-loop-product__title)');
    this.relatedProducts = this.related.locator('li.product');
  }

  tab(name: string): Locator {
    return this.tabLinks.filter({ hasText: name });
  }

  /** Panel of a tab (found through the tab's aria-controls). */
  async panel(name: string): Promise<Locator> {
    const id = await this.tab(name).getAttribute('aria-controls');
    return this.page.locator(`#${id}`);
  }

  /** Choose the first option; returns its visible name. */
  async chooseFirstOption(): Promise<string> {
    const option = this.swatches.first();
    const name = (await option.getAttribute('data-title')) ?? '';
    await option.click();
    await expect(option).toHaveAttribute('aria-checked', 'true');
    return name;
  }
}
