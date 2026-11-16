import { expect, type Locator, type Page } from '@playwright/test';

/** Page object for the PiercingMed homepage (English version, translated client-side by GTranslate). */
export class HomePage {
  readonly page: Page;

  // Cookie banner (Cookie Notice plugin)
  readonly cookieBanner: Locator;
  readonly cookieAccept: Locator;

  // Language switcher (footer, GTranslate widget)
  readonly languageFlags: Locator;
  readonly englishFlag: Locator;

  // Header
  readonly header: Locator;
  readonly logo: Locator;
  readonly searchButton: Locator;
  readonly searchInput: Locator;
  readonly accountLink: Locator;
  readonly cartLink: Locator;

  // Footer
  readonly footerContact: Locator;
  readonly footerPhone: Locator;
  readonly footerEmail: Locator;
  readonly facebookLink: Locator;
  readonly instagramLink: Locator;

  // WhatsApp chat widget (Cresta plugin)
  readonly whatsappButton: Locator;
  readonly whatsappPanel: Locator;
  readonly whatsappTextarea: Locator;
  readonly whatsappSend: Locator;

  // Home page content
  readonly products: Locator;
  readonly productCategoryLinks: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cookieBanner = page.locator('#cookie-notice');
    this.cookieAccept = page.locator('#cn-accept-cookie');

    this.languageFlags = page.locator('.widget_gtranslate a.glink');
    this.englishFlag = page.locator('.widget_gtranslate a.glink[data-gt-lang="en"]');

    this.header = page.locator('nav.navbar');
    this.logo = this.header.locator('a.custom-logo-link');
    this.searchButton = this.header.locator('.header-search-button');
    this.searchInput = this.header.locator('input.search-field');
    this.accountLink = this.header.locator('a[href$="/my-account/"]').last();
    this.cartLink = this.header.locator('a[href$="/carrello/"]');

    this.footerContact = page.locator('#custom_html-2');
    this.footerPhone = this.footerContact.locator('a[href^="tel:"]');
    this.footerEmail = this.footerContact.locator('a[href^="mailto:"]');
    this.facebookLink = page.locator('.footer-social-links a:has(.social_facebook)');
    this.instagramLink = page.locator('.footer-social-links a:has(.social_instagram)');

    this.whatsappButton = page.locator('.cresta-whatsapp-chat-box');
    this.whatsappPanel = page.locator('.cresta-whatsapp-chat-container');
    this.whatsappTextarea = page.locator('.cresta-whatsapp-textarea');
    this.whatsappSend = page.locator('.cresta-whatsapp-send');

    this.products = page.locator('.jet-woo-products__item:not(.slick-cloned) .jet-woo-product-title a');
    this.productCategoryLinks = page.locator(
      '.jet-woo-categories__item:not(.slick-cloned) a.jet-woo-category-title__link',
    );
  }

  /** Open the homepage, accept all cookies and switch the site to English. */
  async open() {
    await this.page.goto('/');
    await this.acceptCookies();
    await this.switchToEnglish();
  }

  async acceptCookies() {
    await expect(this.cookieBanner).toBeVisible();
    await this.cookieAccept.click();
    await expect(this.cookieBanner).toBeHidden();
  }

  async switchToEnglish() {
    // The flag click is ignored if it lands before the GTranslate script is initialised,
    // so repeat it until the page is actually translated.
    await expect(async () => {
      await this.englishFlag.scrollIntoViewIfNeeded({ timeout: 5_000 });
      await this.englishFlag.click({ timeout: 5_000 });
      await expect(this.page.locator('html')).toHaveClass(/translated-ltr/, { timeout: 5_000 });
    }).toPass({ timeout: 50_000 });
    await expect(this.menuLink('/chi-siamo/')).toHaveText('Who We Are');
  }

  /** Link in the main (top) menu, located by its stable href. */
  menuLink(href: string): Locator {
    return this.header.locator(`li > a[href$="${href}"]`);
  }

  /** Link inside a footer widget, located by its stable href. */
  footerLink(widget: string, href: string): Locator {
    return this.page.locator(`${widget} a[href$="${href}"]`);
  }

  /** Link authored with a relative href inside the page content (banners, hero button). */
  contentLink(href: string): Locator {
    return this.page.locator(`.elementor a[href="${href}"]`);
  }

  async openSearch() {
    await this.searchButton.click();
    await expect(this.searchInput).toBeVisible();
  }

  async search(term: string) {
    await this.openSearch();
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
  }
}

/** Pathname of the current page, for asserting on redirects without caring about the host. */
export const currentPath = (page: Page) => new URL(page.url()).pathname;
