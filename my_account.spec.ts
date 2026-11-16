import { test, expect, type Page } from '@playwright/test';
import { HomePage, currentPath } from './pages/HomePage';
import { MyAccountPage } from './pages/MyAccountPage';
import {
  accountDetails, accountMenu, credentials, dashboardLinks, footerAccount, footerLoginErrors, loginErrors,
  logoutMenuText, lostPassword, myAccount, orders, professionalPrice,
} from './data/my_account.data';

// My Account checks. Every test starts by accepting cookies, switching to English and clicking the
// account icon of the top menu. Credentials are read from .env (USER_EMAIL / USER_PASSWORD).
test.describe('My account', () => {
  let account: MyAccountPage;

  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    account = new MyAccountPage(page);
    await home.open();
    await home.accountLink.click();
    await expect.poll(() => currentPath(page)).toBe(myAccount.path);
  });

  test('login page opens and "Lost your password?" sends a reset e-mail message', async ({ page }) => {
    await expect(account.title).toHaveText(myAccount.title, { ignoreCase: true });
    await expect(account.loginForm).toBeVisible();
    await expect(account.username).toBeVisible();
    await expect(account.password).toBeVisible();
    await expect(account.loginButton).toBeVisible();

    await account.lostPasswordLink.click();
    await expect.poll(() => currentPath(page)).toBe(myAccount.lostPasswordPath);
    await expect(account.title).toHaveText(myAccount.title, { ignoreCase: true });

    await account.resetUsername.fill(lostPassword.email);
    await account.resetButton.click();
    await expect(account.resetMessage).toHaveText(lostPassword.sentMessage);
  });

  test('login without ticking reCAPTCHA shows "Recaptcha Error"', async () => {
    test.skip(!credentials.username || !credentials.password, 'USER_EMAIL / USER_PASSWORD are not set in .env');
    await account.login(credentials.username, credentials.password);
    await expect(account.loginError).toHaveText(loginErrors.recaptcha);
    await expect(account.loginForm).toBeVisible();
  });

  // Google shows an image challenge to automated browsers, which is not solved here. The test records
  // what happened; if the checkbox is ever accepted without a challenge it goes on to log in.
  test('reCAPTCHA checkbox: tick it and log in if Google lets automation through', async () => {
    test.skip(!credentials.username || !credentials.password, 'USER_EMAIL / USER_PASSWORD are not set in .env');
    await account.fillCredentials(credentials.username, credentials.password);
    await account.recaptchaAnchor.scrollIntoViewIfNeeded();

    const accepted = await account.tickRecaptcha();
    if (!accepted) {
      test.info().annotations.push({ type: 'recaptcha', description: 'Google showed an image challenge; the checkbox cannot be ticked by automation' });
      await expect(account.recaptchaChallenge).toBeVisible();
      await expect(account.recaptchaAnchor).toHaveAttribute('aria-checked', 'false');
      return;
    }

    await account.loginButton.click();
    await expect(account.loginError).toHaveCount(0);
    await expect(account.loginForm).toBeHidden();
  });
});

// The "My account" link in the footer opens /mio-account/, a plain WooCommerce login without
// reCAPTCHA, so these tests can really sign in. Every test starts from the footer link.
test.describe('My account (footer login page)', () => {
  let home: HomePage;
  let account: MyAccountPage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    account = new MyAccountPage(page);
    await home.open();
    const link = home.footerLink('.widget_nav_menu', footerAccount.path);
    await link.scrollIntoViewIfNeeded();
    await expect(link).toHaveText(footerAccount.footerLinkText);
    await link.click();
    await expect.poll(() => currentPath(page)).toBe(footerAccount.path);
  });

  // logged-in admins get an extra "Please wait, copying..." h1, so pick the heading by its text
  const heading = (page: Page) => page.locator('h1', { hasText: /my account/i });
  /** A form post reloads the page; make sure it is (still) translated to English before reading messages. */
  async function inEnglish(page: Page) {
    const translated = await expect(page.locator('html')).toHaveClass(/translated-ltr/, { timeout: 5_000 }).then(() => true, () => false);
    if (!translated) await home.switchToEnglish();
  }

  const form = (page: Page) => page.locator('form.woocommerce-form-login');
  const username = (page: Page) => form(page).locator('#username');
  const password = (page: Page) => form(page).locator('#password');
  const signIn = (page: Page) => form(page).locator('button[name="login"]');

  /** Sign in with the .env credentials and wait for the logged-in area. */
  async function login(page: Page) {
    test.skip(!credentials.username || !credentials.password, 'USER_EMAIL / USER_PASSWORD are not set in .env');
    await username(page).fill(credentials.username);
    await password(page).fill(credentials.password);
    await signIn(page).click();
    await expect(account.navigation).toBeVisible();
    await inEnglish(page);
  }

  // Menu items carry an icon glyph in their name, so find them by their (stable) href and check the text separately.
  const menuItem = (text: string) => {
    const path = accountMenu.find((m) => m.text === text)!.path;
    return account.navigation.locator(`a[href$="${path}"]`).filter({ hasText: text });
  };

  /** Click an item of the account menu and check where it leads. */
  async function openMenu(page: Page, text: string, path: string) {
    await menuItem(text).click();
    await expect.poll(() => currentPath(page)).toBe(path);
    await inEnglish(page);
  }

  test('login page has the correct title and English labels', async ({ page }) => {
    await expect(page).toHaveTitle(footerAccount.browserTitle);
    await expect(heading(page)).toHaveText(footerAccount.title, { ignoreCase: true });
    await expect(page.locator('h2').filter({ hasText: footerAccount.loginHeading }).first()).toBeVisible();
    await expect(form(page).locator('label[for="username"]')).toContainText(footerAccount.labels.username);
    await expect(form(page).locator('label[for="password"]')).toContainText(footerAccount.labels.password);
    await expect(form(page).locator('.woocommerce-form-login__rememberme')).toContainText(footerAccount.labels.remember);
    await expect(signIn(page)).toHaveText(footerAccount.signIn, { ignoreCase: true });
    await expect(form(page).locator('.lost_password a')).toHaveText(footerAccount.lostPassword);
  });

  test('empty fields show "Username is required."', async ({ page }) => {
    await signIn(page).click();
    await inEnglish(page);
    await expect(account.loginNotices).toContainText(footerLoginErrors.noUsername);
    await expect(form(page)).toBeVisible();
  });

  test('only the username filled in shows "The password field is empty."', async ({ page }) => {
    await username(page).fill(credentials.username || 'someone@example.com');
    await signIn(page).click();
    await inEnglish(page);
    await expect(account.loginNotices).toContainText(footerLoginErrors.noPassword);
  });

  test('only the password filled in shows "Username is required."', async ({ page }) => {
    await password(page).fill('some-password');
    await signIn(page).click();
    await inEnglish(page);
    await expect(account.loginNotices).toContainText(footerLoginErrors.noUsername);
  });

  test('valid credentials open the account and the user is logged in', async ({ page }) => {
    await login(page);
    await expect(page).toHaveTitle(footerAccount.browserTitle);
    await expect(heading(page)).toHaveText(footerAccount.title, { ignoreCase: true });
    await expect(form(page)).toHaveCount(0);
    await expect(account.content).toContainText(/Hello .*\(Are you not .*\? Logout \)/);
    await expect(account.contentLogout).toBeVisible();
    for (const item of accountMenu) {
      await expect(menuItem(item.text)).toBeVisible();
    }
    await expect(account.navigation.locator('a[href*="customer-logout"]').filter({ hasText: logoutMenuText })).toBeVisible();
  });

  test('Noticeboard links are valid', async ({ page }) => {
    await login(page);
    // side menu
    for (const item of accountMenu) {
      await openMenu(page, item.text, item.path);
      await expect(heading(page)).toHaveText(footerAccount.title, { ignoreCase: true });
      await expect(page.locator('body')).not.toHaveClass(/error404/);
    }
    // links inside the dashboard text
    for (const link of dashboardLinks) {
      await openMenu(page, 'Noticeboard', '/mio-account/');
      await account.content.locator(`a[href$="${link.path}"]`).filter({ hasText: link.text }).click();
      await expect.poll(() => currentPath(page), link.text).toBe(link.path);
      await inEnglish(page);
      await expect(page.locator('body')).not.toHaveClass(/error404/);
    }
    // both logout links point to a logout URL (not clicked here)
    await openMenu(page, 'Noticeboard', '/mio-account/');
    await expect(account.contentLogout).toHaveAttribute('href', /logout/);
    await expect(account.navigation.locator('a[href*="customer-logout"]').filter({ hasText: logoutMenuText })).toHaveAttribute('href', /customer-logout/);
  });

  test('Orders page has English columns and "View order" opens the order details', async ({ page }) => {
    await login(page);
    await openMenu(page, 'Orders', '/mio-account/orders/');
    await expect(account.ordersTable).toBeVisible();
    await expect(account.ordersTable.locator('thead th')).toHaveText(orders.columns);
    const first = account.ordersTable.locator('tbody tr').first();
    await expect(first.locator('.woocommerce-orders-table__cell-order-number')).toHaveText(/^\s*#\d+\s*$/);
    await expect(first.locator('.woocommerce-orders-table__cell-order-date')).toContainText(/[A-Z][a-z]+ \d{1,2}, \d{4}/);
    const viewButton = first.locator('.woocommerce-orders-table__cell-order-actions a');
    await expect(viewButton).toHaveText(orders.viewButton, { ignoreCase: true });
    const number = (await first.locator('.woocommerce-orders-table__cell-order-number').innerText()).replace(/\D/g, '');

    await viewButton.click();
    await expect.poll(() => currentPath(page)).toMatch(orders.viewPath);
    expect(currentPath(page)).toContain(`/${number}/`);
    await expect(account.content).toContainText(new RegExp(`The order #${number}\\s*it was created.*and is currently`, 's'));
    await expect(account.content.locator('h2').first()).toHaveText(orders.detailsHeading, { ignoreCase: true });
    for (const head of orders.tableHeads) {
      await expect(account.content.locator('th', { hasText: head }).first(), `column "${head}"`).toBeVisible();
    }
    for (const head of orders.addressHeadings) {
      await expect(account.content.locator('h2', { hasText: new RegExp(`^${head}$`, 'i') }), head).toBeVisible();
    }
  });

  test('Account details page has English titles and field labels', async ({ page }) => {
    await login(page);
    await openMenu(page, 'Account Details', '/mio-account/edit-account/');
    for (const [id, text] of accountDetails.labels) {
      await expect(account.editForm.locator(`label[for="${id}"]`), `label of #${id}`).toContainText(text);
    }
    for (const legend of accountDetails.legends) {
      await expect(account.editForm.locator('legend', { hasText: legend })).toBeVisible();
    }
    await expect(account.saveDetails).toHaveText(accountDetails.saveButton, { ignoreCase: true });
  });

  test('Account details: empty required fields show validation messages', async ({ page }) => {
    await login(page);
    await openMenu(page, 'Account Details', '/mio-account/edit-account/');
    await account.editForm.locator('#account_first_name').fill('');
    await account.editForm.locator('#account_last_name').fill('');
    await account.saveDetails.click();
    await inEnglish(page);
    for (const message of accountDetails.requiredErrors) {
      await expect(account.notices).toContainText(message);
    }
  });

  test('Account details: different new passwords show a validation message', async ({ page }) => {
    await login(page);
    await openMenu(page, 'Account Details', '/mio-account/edit-account/');
    await account.editForm.locator('#password_current').fill('not-the-real-password');
    await account.editForm.locator('#password_1').fill('Abcdef1!xyz');
    await account.editForm.locator('#password_2').fill('Different1!yzx');
    await account.saveDetails.click();
    await inEnglish(page);
    await expect(account.notices).toContainText(accountDetails.passwordMismatch);
  });

  test('special prices: a logged-in user sees "Price for professionals" on a product', async ({ page }) => {
    await login(page);
    await home.menuLink(professionalPrice.piercingHref).hover();
    await home.menuLink(professionalPrice.secretFaunaHref).click();
    await expect.poll(() => currentPath(page)).toBe(professionalPrice.secretFaunaHref);
    await page.locator('ul.products li.product-category').filter({ hasText: professionalPrice.categoryName }).first().locator('a').first().click();
    await expect(page.locator('h1').first()).toHaveText(professionalPrice.categoryName, { ignoreCase: true });
    await page.locator('ul.products li.product').first().locator('a').first().click();
    await expect(page.locator('.summary').getByText(professionalPrice.text).first()).toBeVisible();
    await expect(page.locator('.summary .price .amount').first()).toBeVisible();
  });

  test('Logout from My account logs the user out', async ({ page }) => {
    await login(page);
    // the account icon of the top menu opens /my-account/ (User Registration dashboard) for a logged-in user
    await home.accountLink.click();
    await expect.poll(() => currentPath(page)).toBe(myAccount.path);
    const logout = page.locator('.user-registration-MyAccount-navigation a[href*="logout"]');
    await expect(logout).toBeVisible();
    await logout.click();
    // WordPress may ask to confirm the logout first
    const confirm = page.getByRole('link', { name: /log out/i });
    if (await confirm.isVisible().catch(() => false)) await confirm.click();
    // logged out: the login form is shown again and no logout link remains
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('a[href*="logout"]')).toHaveCount(0);
    // the footer "My account" page asks for the credentials again
    await page.locator('.widget_nav_menu a[href$="/mio-account/"]').click();
    await expect(form(page)).toBeVisible();
    await expect(account.navigation).toHaveCount(0);
  });
});
