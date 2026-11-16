import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage, ShopPage } from './pages/ShopPage';
import { category, priceFilter, productTabs, relatedProductsTitle } from './data/shop_product_page.data';

// Shop (category) page and product page checks for Piercing > Tremun Gold. Every test starts by
// accepting cookies, switching to English (HomePage.open()) and opening the category from the top menu.
test.describe('Shop and product page', () => {
  let shop: ShopPage;

  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    shop = new ShopPage(page);
    await home.open();
    await shop.openFromMenu(home);
  });

  test('Tremun Gold category opens with its title and products', async () => {
    await expect(shop.title).toHaveText(category.title, { ignoreCase: true });
    await expect(shop.cards.first()).toBeVisible();
  });

  // KNOWN SITE DEFECT: the price filter keeps products outside the selected range (e.g. 160 - 190 EUR
  // with a 30 - 100 filter). test.fail() turns red once it is fixed (then remove test.fail()).
  test(`price filter ${priceFilter.min}-${priceFilter.max} EUR only shows products within the range`, async () => {
    test.fail(true, 'Price filter still lists products above the selected maximum');
    await shop.setPriceRange(priceFilter.min, priceFilter.max);
    await expect(shop.priceLabel).toContainText(`${priceFilter.min}`);
    await expect(shop.priceLabel).toContainText(`${priceFilter.max}`);
    await expect(shop.cards.first()).toBeVisible();

    for (const { product, price } of await shop.allPrices()) {
      expect(price, `${product} costs ${price}`).toBeGreaterThanOrEqual(priceFilter.min);
      expect(price, `${product} costs ${price}`).toBeLessThanOrEqual(priceFilter.max);
    }
  });

  test('product with options: title, selected option, info tabs and related products', async ({ page }) => {
    // Same as a visitor: filter first, then pick the first product with a "You choose" button.
    await shop.setPriceRange(priceFilter.min, priceFilter.max);
    const card = shop.firstProductWithOptions();
    await expect(card).toBeVisible();
    const name = await shop.productName(card);
    await shop.openProduct(card);

    const product = new ProductDetailPage(page);
    await expect(product.title).toHaveText(name, { ignoreCase: true });

    const option = await product.chooseFirstOption();
    expect(option).not.toBe('');
    await expect(product.measure).toContainText(`Measure: ${option}`);

    for (const tab of productTabs) {
      await expect(product.tab(tab), `tab "${tab}"`).toBeVisible();
      await product.tab(tab).click();
      await expect(await product.panel(tab), `panel "${tab}"`).toBeVisible();
    }

    await product.related.scrollIntoViewIfNeeded();
    await expect(product.relatedTitle).toHaveText(relatedProductsTitle, { ignoreCase: true });
    await expect(product.relatedProducts.first()).toBeVisible();
    expect(await product.relatedProducts.count()).toBeGreaterThan(0);
  });
});
