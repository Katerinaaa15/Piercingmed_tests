import { test, expect, type Locator, type Page } from '@playwright/test';
import { HomePage, currentPath } from './pages/HomePage';

// "Map of dealers" (/rivenditori/) page checks. The page is an Agile Store Locator widget
// (Google Maps). Every test: accept cookies, switch to English in the footer language switcher,
// click "Map of Dealers" in the footer menu.
const dealers = {
  path: '/rivenditori/',
  footerLinkText: 'Map of Dealers',
  browserTitle: 'Resellers - PiercingMed',
  heading: 'Resellers',
  searchLabel: 'Location search',
  categoryLabel: 'Category',
  totalLocations: 39, // number of dealers in the list at the time of writing
  searchTerm: 'Milan',
};

class DealersPage {
  readonly heading: Locator;
  readonly searchLabel: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly suggestions: Locator;
  readonly categoryLabel: Locator;
  readonly categoryButton: Locator;
  readonly categoryOptions: Locator;
  readonly locationsHeader: Locator;
  readonly locationsCount: Locator;
  readonly items: Locator;
  readonly map: Locator;
  readonly directionsModal: Locator;
  readonly directionsFrom: Locator;
  readonly directionsTo: Locator;
  readonly directionsSubmit: Locator;
  readonly storeManagement: Locator;
  readonly routeSteps: Locator;

  constructor(readonly page: Page) {
    this.heading = page.locator('h1.module-title');
    this.searchLabel = page.locator('.asl-cont label', { hasText: dealers.searchLabel });
    this.searchInput = page.locator('#auto-complete-search');
    this.searchButton = page.locator('.asl-search-event');
    this.suggestions = page.locator('.pac-item');
    this.categoryLabel = page.locator('.asl-cont label', { hasText: dealers.categoryLabel });
    this.categoryButton = page.locator('#categories_filter button.multiselect');
    this.categoryOptions = page.locator('#categories_filter .multiselect-container li');
    this.locationsHeader = page.locator('.Num_of_store');
    this.locationsCount = page.locator('.Num_of_store .count-result');
    this.items = page.locator('#asl-list li.sl-item');
    this.map = page.locator('#asl-map-canv');
    this.directionsModal = page.locator('#agile-modal-direction');
    this.directionsFrom = page.locator('#frm-lbl');
    this.directionsTo = page.locator('#to-lbl');
    this.directionsSubmit = page.locator('#agile-modal-direction .btn-submit');
    this.storeManagement = page.locator('.directions-cont');
    this.routeSteps = page.locator('#asl-rendered-dir');
  }

  async waitForList() {
    await expect(this.items.first()).toBeVisible({ timeout: 30_000 });
    await expect(this.locationsCount).toHaveText(String(dealers.totalLocations), { timeout: 30_000 });
  }

  async count() {
    return Number((await this.locationsCount.innerText()).trim());
  }

  /** Type in a Google Places autocomplete input and pick the first suggestion. */
  async pickPlace(input: Locator, term: string) {
    await input.click();
    await input.pressSequentially(term, { delay: 80 });
    await expect(this.suggestions.first()).toBeVisible({ timeout: 15_000 });
    await this.suggestions.first().click();
  }
}

test.describe('Map of dealers page', () => {
  let d: DealersPage;

  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    d = new DealersPage(page);
    await home.open(); // cookies + switch to English in the footer
    const link = home.footerLink('.widget_nav_menu', dealers.path);
    await link.scrollIntoViewIfNeeded();
    await expect(link).toHaveText(dealers.footerLinkText);
    await link.click();
    await expect.poll(() => currentPath(page)).toBe(dealers.path);
    await d.waitForList();
  });

  test('footer link opens the Resellers page', async ({ page }) => {
    await expect(page).toHaveTitle(dealers.browserTitle);
    await expect(d.heading).toHaveText(dealers.heading, { ignoreCase: true });
  });

  test('page is translated to English', async ({ page }) => {
    await expect(page.locator('html')).toHaveClass(/translated-ltr/);
    await expect(d.searchLabel).toBeVisible();
    await expect(d.categoryLabel).toBeVisible();
    await expect(d.locationsHeader).toContainText('Locations');
  });

  test('location search bar finds dealers around Milan', async () => {
    await expect(d.searchInput).toBeVisible();
    await expect(d.searchButton).toBeVisible();
    await d.pickPlace(d.searchInput, dealers.searchTerm);
    await expect(d.searchInput).toHaveValue(/Milan/i);
    // the list is narrowed down to the dealers near Milan
    await expect.poll(() => d.count()).toBeLessThan(dealers.totalLocations);
    expect(await d.count()).toBeGreaterThan(0);
    await expect(d.items).toHaveCount(await d.count());
    // nearest first: every item shows its distance
    await expect(d.items.first().locator('.s-distance')).toContainText(/\d+(\.\d+)? (km|mi)/i);
  });

  // KNOWN SITE ISSUE: once the category selector is clicked the dropdown may be rendered empty,
  // although it should contain the "Partners" category (and "All categories" as the default).
  test('category selector offers "All categories" and "Partners"', async () => {
    await expect(d.categoryButton).toBeVisible();
    await expect(d.categoryButton).toContainText(/all categories/i);
    await d.categoryButton.click();
    await expect(d.categoryOptions, 'dropdown must not be empty').not.toHaveCount(0);
    await expect(d.categoryOptions.filter({ hasText: 'Partners' })).toBeVisible();
  });

  test('selecting the "Partners" category filters the list', async () => {
    await d.categoryButton.click();
    // the checkbox input itself is visually hidden, so click its label
    await d.categoryOptions.filter({ hasText: 'Partners' }).locator('label').click();
    await expect(d.categoryButton).toContainText('Partners');
    await expect.poll(() => d.count()).toBeLessThanOrEqual(dealers.totalLocations);
    const n = await d.count();
    expect(n).toBeGreaterThan(0);
    for (const item of await d.items.all()) {
      await expect(item.locator('.sl-categories')).toContainText('Partners');
    }
  });

  test('locations section shows the number of locations and sorting', async () => {
    await expect(d.locationsHeader).toContainText('Locations');
    await expect(d.locationsCount).toHaveText(String(dealers.totalLocations));
    await expect(d.items).toHaveCount(dealers.totalLocations);
    const sort = d.page.locator('#asl-list-sort');
    await expect(sort).toBeVisible();
    await expect(sort.locator('option')).toHaveText(['Nearest', 'Title', 'City', 'states', 'Categories']);
  });

  test('every location has a title, an address and contact info', async () => {
    const items = await d.items.all();
    expect(items.length).toBe(dealers.totalLocations);
    for (const [i, item] of items.entries()) {
      const title = (await item.locator('h3').innerText()).trim();
      const ctx = `location #${i + 1} "${title}"`;
      expect(title, `${ctx}: title`).not.toBe('');
      const address = (await item.locator('.sl-addr').innerText()).trim();
      expect(address, `${ctx}: address`).not.toBe('');
      // contact info: a phone number and/or an e-mail address
      const phone = (await item.locator('.sl-phone').allInnerTexts()).join('').trim();
      const email = (await item.locator('.sl-email').allInnerTexts()).join('').trim();
      expect(phone + email, `${ctx}: contact info`).not.toBe('');
      if (email) expect(email, `${ctx}: email`).toMatch(/^\S+@\S+\.\S+$/);
      // every item has the action buttons
      await expect(item.locator('a.s-direction'), `${ctx}: directions`).toHaveCount(1);
    }
  });

  test('"Directions" button opens the Get directions window', async () => {
    const first = d.items.first();
    const title = (await first.locator('h3').innerText()).trim();
    await first.locator('a.s-direction').click();
    await expect(d.directionsModal).toBeVisible();
    // the modal is built dynamically, so the translator may not have translated it yet
    await expect(d.directionsModal).toContainText(/get directions|ottenere direzioni/i);
    await expect(d.directionsFrom).toBeVisible();
    await expect(d.directionsTo).toHaveValue(title); // destination is pre-filled with the dealer
    await expect(d.directionsSubmit).toBeVisible();
    await d.directionsModal.locator('.close-directions').click();
    await expect(d.directionsModal).toBeHidden();
  });

  test('directions from Milan show the Store Management section with a route', async () => {
    await d.items.first().locator('a.s-direction').click();
    await expect(d.directionsModal).toBeVisible();
    await d.pickPlace(d.directionsFrom, dealers.searchTerm);
    await expect(d.directionsFrom).toHaveValue(/Milan/i);
    await d.directionsSubmit.click();
    // Only that the section is displayed (the route correctness is not checked). The page may be
    // re-rendered by the translator after the route is built, so accept both languages.
    await expect(d.storeManagement).toBeVisible({ timeout: 20_000 });
    await expect(d.storeManagement.locator('h4')).toHaveText(/store management|direzione del negozio/i);
    await expect(d.routeSteps).not.toBeEmpty();
    await expect(d.routeSteps).toContainText(/\d/);
  });

  test('map is displayed with Google Maps and dealer markers', async () => {
    await expect(d.map).toBeVisible();
    const box = await d.map.boundingBox();
    expect(box!.width).toBeGreaterThan(300);
    expect(box!.height).toBeGreaterThan(300);
    await expect(d.map.locator('.gm-style').first()).toBeVisible();
    await expect(d.map.getByRole('button', { name: /map|satellite/i }).first()).toBeVisible();
    await expect(d.map.locator('.gm-fullscreen-control')).toBeVisible();
    await expect(d.map.locator('.gm-style img').first()).toBeAttached(); // tiles / markers
  });

  test('clicking a location in the list keeps map and list in sync', async () => {
    const second = d.items.nth(1);
    const title = (await second.locator('h3').innerText()).trim();
    await second.locator('h3').click();
    await expect(d.map).toBeVisible();
    await expect(d.items.filter({ hasText: title }).first()).toBeVisible();
  });
});
