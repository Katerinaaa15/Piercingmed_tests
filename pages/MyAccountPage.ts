import { expect, type FrameLocator, type Locator, type Page } from '@playwright/test';

/** My Account page: login form (User Registration plugin) and the lost-password form (WooCommerce). */
export class MyAccountPage {
  readonly page: Page;
  readonly title: Locator;

  // Login form
  readonly loginForm: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly lostPasswordLink: Locator;
  readonly loginError: Locator;

  // reCAPTCHA (Google iframes)
  readonly recaptchaFrame: FrameLocator;
  readonly recaptchaAnchor: Locator;
  readonly recaptchaChallenge: Locator;

  // Logged-in area (WooCommerce My Account)
  readonly navigation: Locator;
  readonly content: Locator;
  readonly notices: Locator;
  readonly loginNotices: Locator;
  readonly ordersTable: Locator;
  readonly editForm: Locator;
  readonly saveDetails: Locator;
  readonly contentLogout: Locator;

  // Lost password form
  readonly resetForm: Locator;
  readonly resetUsername: Locator;
  readonly resetButton: Locator;
  readonly resetMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1').first();

    this.loginForm = page.locator('form.user-registration-form-login');
    this.username = this.loginForm.locator('#username');
    this.password = this.loginForm.locator('#password');
    this.loginButton = this.loginForm.locator('button[name="login"]');
    this.lostPasswordLink = this.loginForm.locator('.lost_password a');
    this.loginError = page.locator('.user-registration-error');

    this.loginNotices = page.locator('.woocommerce-error');
    this.navigation = page.locator('.woocommerce-MyAccount-navigation');
    this.content = page.locator('.woocommerce-MyAccount-content');
    this.notices = page.locator('.woocommerce-error, .woocommerce-message');
    this.ordersTable = page.locator('table.woocommerce-orders-table');
    this.editForm = page.locator('form.edit-account');
    this.saveDetails = this.editForm.locator('button[name="save_account_details"]');
    this.contentLogout = this.content.getByRole('link', { name: 'Logout' });

    this.recaptchaFrame = page.frameLocator('iframe[title="reCAPTCHA"]');
    this.recaptchaAnchor = this.recaptchaFrame.locator('#recaptcha-anchor');
    this.recaptchaChallenge = page.locator('iframe[title*="recaptcha challenge"]');

    this.resetForm = page.locator('form.lost_reset_password');
    this.resetUsername = this.resetForm.locator('#user_login');
    this.resetButton = this.resetForm.locator('button[type="submit"]');
    this.resetMessage = page.locator('.woocommerce-message');
  }

  async fillCredentials(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
  }

  async login(username: string, password: string) {
    await this.fillCredentials(username, password);
    await this.loginButton.click();
  }

  /** Click the "I'm not a robot" checkbox. Returns true if Google accepted it without a challenge. */
  async tickRecaptcha(): Promise<boolean> {
    await this.recaptchaFrame.locator('.recaptcha-checkbox-border').click();
    // Either the box turns checked, or Google opens an image challenge.
    await expect
      .poll(async () => (await this.recaptchaAnchor.getAttribute('aria-checked')) === 'true' || (await this.recaptchaChallenge.isVisible()), {
        timeout: 20_000,
      })
      .toBe(true);
    return (await this.recaptchaAnchor.getAttribute('aria-checked')) === 'true';
  }
}
