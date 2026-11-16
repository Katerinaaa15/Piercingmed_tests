import { test, expect } from '@playwright/test';
import { HomePage, currentPath } from './pages/HomePage';
import { contact, footerLinks, mainMenu, search, subMenus } from './data/homepage.data';

// Essential homepage smoke tests. The site is tested in English only: every test starts by
// accepting cookies and switching the language with the footer flag (HomePage.open()).
// Menu / footer link lists in data/homepage.data.ts are sampled, not exhaustively clicked.
const menuSample = mainMenu.filter((m) => ['Piercing', 'Offers'].includes(m.name));
const footerSample = footerLinks.filter((l) => ['Contacts', 'Privacy Policy'].includes(l.name));
const piercingMenu = subMenus[0];

test.describe('Homepage - cookies and language', () => {
  test('cookie banner is shown and "Accept" dismisses it for good', async ({ page, context }) => {
    const home = new HomePage(page);
    await page.goto('/');

    await expect(home.cookieBanner).toBeVisible();
    await expect(home.cookieAccept).toBeVisible();
    await expect(page.locator('#cn-refuse-cookie')).toBeVisible();

    await home.cookieAccept.click();
    await expect(home.cookieBanner).toBeHidden();
    expect((await context.cookies()).some((c) => c.name === 'cookie_notice_accepted' && c.value === 'true')).toBe(true);

    await page.reload();
    await expect(home.cookieBanner).toBeHidden();
  });

  test('footer offers 4 languages and switching to English translates the page', async ({ page }) => {
    const home = new HomePage(page);
    await page.goto('/');
    await home.acceptCookies();

    await expect(home.languageFlags).toHaveCount(4);
    for (const lang of ['en', 'fr', 'de', 'it']) {
      await expect(page.locator(`.widget_gtranslate a.glink[data-gt-lang="${lang}"]`)).toHaveCount(1);
    }

    await home.switchToEnglish();
    await expect(home.menuLink('/offerte/')).toHaveText('Offers');
    await expect(page.getByRole('heading', { name: 'Latest additions' })).toBeVisible();
  });
});

test.describe('Homepage - header and main menu', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.open();
  });

  test('header shows logo, menu, search, account and cart', async () => {
    await expect(home.logo).toBeVisible();
    for (const item of mainMenu) {
      await expect(home.menuLink(item.href)).toHaveText(item.label);
    }
    await expect(home.searchButton).toBeVisible();
    await expect(home.accountLink).toBeVisible();
    await expect(home.cartLink).toBeVisible();
  });

  test('logo link leads back to the homepage', async ({ page }) => {
    await home.menuLink('/offerte/').click();
    await expect.poll(() => currentPath(page)).toBe('/offerte/');
    await home.logo.click();
    await expect.poll(() => currentPath(page)).toBe('/');
  });

  for (const item of menuSample) {
    test(`main menu "${item.name}" opens ${item.expectedPath}`, async ({ page }) => {
      await home.menuLink(item.href).click();
      await expect.poll(() => currentPath(page)).toBe(item.expectedPath);
      await expect(page.locator('body')).not.toHaveClass(/error404/);
    });
  }

  test(`"${piercingMenu.parentName}" dropdown lists its sub-menu links`, async () => {
    await home.menuLink(piercingMenu.parent).hover();
    for (const child of piercingMenu.children) {
      await expect(home.menuLink(child), `${child} should be visible in the dropdown`).toBeVisible();
    }
  });

  test('account icon opens the My Account page', async ({ page }) => {
    await home.accountLink.click();
    await expect.poll(() => currentPath(page)).toBe('/my-account/');
  });

  test('cart icon opens the cart page and shows an empty counter', async ({ page }) => {
    await expect(home.cartLink).toContainText('0');
    await home.cartLink.click();
    await expect.poll(() => currentPath(page)).toBe('/carrello/');
  });
});

test.describe('Homepage - search', () => {
  test(`search icon reveals the field and "${search.term}" returns matching products`, async ({ page }) => {
    const home = new HomePage(page);
    await home.open();

    await expect(home.searchInput).toBeHidden();
    await home.search(search.term);
    await expect(page).toHaveURL(new RegExp(`[?&]s=${search.term}(&|$)`));
    await expect(page).toHaveURL(/post_type=product/);

    const cards = page.locator('ul.products li.product');
    await expect(cards.first()).toBeVisible();
    await expect(cards.locator('.woocommerce-loop-product__title').filter({ hasText: /ring/i }).first()).toBeVisible();
  });
});

test.describe('Homepage - footer', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.open();
  });

  for (const item of footerSample) {
    test(`footer link "${item.name}" opens ${item.expectedPath}`, async ({ page }) => {
      const link = home.footerLink(item.widget, item.href);
      await link.scrollIntoViewIfNeeded();
      await expect(link).toHaveText(item.label);
      await link.click();
      await expect.poll(() => currentPath(page)).toBe(item.expectedPath);
    });
  }

  test('footer contact block shows address, phone and e-mail with correct links', async () => {
    await home.footerContact.scrollIntoViewIfNeeded();
    await expect(home.footerContact).toContainText('Via Borgazzi, 22');
    await expect(home.footerContact).toContainText('20900 Monza');
    await expect(home.footerPhone).toHaveText(contact.phoneText);
    await expect(home.footerPhone).toHaveAttribute('href', contact.phoneHref);
    await expect(home.footerEmail).toHaveText(contact.emailText);
    await expect(home.footerEmail).toHaveAttribute('href', contact.emailHref);
  });

  // KNOWN SITE DEFECT: the Facebook icon in the footer has href="#" (no page is configured).
  // test.fail() keeps the suite green while the defect exists, and turns red as soon as it is fixed
  // (remove test.fail() then).
  test('footer Facebook icon links to a Facebook page', async ({ page }) => {
    test.fail(true, 'Footer Facebook link currently has href="#" instead of the Facebook page URL');
    await home.facebookLink.scrollIntoViewIfNeeded();
    await expect(home.facebookLink).toBeVisible();
    await expect(home.facebookLink).toHaveAttribute('href', /^https:\/\/(www\.)?facebook\.com\/.+/);
    await expect(home.facebookLink).toHaveAttribute('target', '_blank');
  });

  test('footer Instagram icon links to the PiercingMed Instagram profile in a new tab', async ({ page }) => {
    await home.instagramLink.scrollIntoViewIfNeeded();
    await expect(home.instagramLink).toBeVisible();
    await expect(home.instagramLink).toHaveAttribute('href', contact.instagram);
    await expect(home.instagramLink).toHaveAttribute('target', '_blank');

    const [popup] = await Promise.all([page.waitForEvent('popup'), home.instagramLink.click()]);
    await expect.poll(() => popup.url(), { message: 'popup should open Instagram' }).toMatch(/^https:\/\/(www\.)?instagram\.com\//);
    expect(currentPath(page)).toBe('/');
  });
});
