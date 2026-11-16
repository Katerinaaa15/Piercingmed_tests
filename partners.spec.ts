import { test, expect, type Page } from '@playwright/test';
import { HomePage, currentPath } from './pages/HomePage';

// "Register as a partner" (/registrati-come-partner/), a WPForms form.
const partner = {
  path: '/registrati-come-partner/',
  title: 'Register as a partner - PiercingMed',
  heading: 'Register as a partner',
  submit: 'Send',
  required: 'This field is required.',
  invalidEmail: 'Please enter a valid email address.',
  // input id -> English label
  fields: {
    'wpforms-4447-field_4': 'Studio Name (displayed on map) *',
    'wpforms-4447-field_15': 'PiercingMED Username (or Name)',
    'wpforms-4447-field_2': 'Company Name',
    'wpforms-4447-field_7': 'E-Mail (that you use as a piercingMED reseller) *',
    'wpforms-4447-field_16': 'Contact (Tel/Cell)',
    'wpforms-4447-field_18': 'Instagram link',
    'wpforms-4447-field_19': 'Facebook link',
    'wpforms-4447-field_20': 'Province (for customer collection point) *',
    'wpforms-4447-field_21': 'Municipality (for customer collection point) *',
    'wpforms-4447-field_22': 'ZIP Code (for customer collection point) *',
    'wpforms-4447-field_23': 'Address (for customer collection point) *',
  } as Record<string, string>,
  privacyId: 'wpforms-4447-field_24_1',
  privacyLabel: 'I declare that I have read the Privacy Policy and consent to this site storing the information I submit so it can process my request.',
  emailId: 'wpforms-4447-field_7',
  mandatory: [
    'wpforms-4447-field_4', 'wpforms-4447-field_7', 'wpforms-4447-field_20', 'wpforms-4447-field_21',
    'wpforms-4447-field_22', 'wpforms-4447-field_23', 'wpforms-4447-field_24_1',
  ],
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const submit = (page: Page) => page.locator('form.wpforms-form button[type="submit"]');
const visibleErrors = (page: Page) => page.locator('form.wpforms-form label.wpforms-error').filter({ visible: true });
/** The validation message of a field (WPForms: "<input id>-error", checkboxes use their name). */
const messageOf = (page: Page, id: string) => {
  const cb = id.match(/^wpforms-\d+-field_(\d+)_1$/);
  return page.locator(`label.wpforms-error[id="${cb ? `wpforms[fields][${cb[1]}][]` : id}-error"]`);
};

test.describe('Register as a partner page', () => {
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    const link = home.footerLink('.widget_nav_menu', partner.path);
    await link.scrollIntoViewIfNeeded();
    await expect(link).toHaveText('Register as a partner');
    await link.click();
    await expect.poll(() => currentPath(page)).toBe(partner.path);
    await expect(page.locator('form.wpforms-form')).toBeVisible();
  });

  test('page has the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(partner.title);
    await expect(page.locator('h1')).toHaveText(partner.heading, { ignoreCase: true });
  });

  test('all fields have English labels', async ({ page }) => {
    for (const [id, text] of Object.entries(partner.fields)) {
      await expect(page.locator(`label[for="${id}"]`).first(), `label of #${id}`)
        .toHaveText(new RegExp(`^\\s*${esc(text)}\\s*$`));
    }
    await expect(page.locator(`label[for="${partner.privacyId}"]`)).toContainText(partner.privacyLabel);
    await expect(submit(page)).toHaveText(partner.submit, { ignoreCase: true });
  });

  test('empty form shows "This field is required." under each mandatory field', async ({ page }) => {
    await submit(page).click();
    await expect(visibleErrors(page)).toHaveCount(partner.mandatory.length);
    for (const id of partner.mandatory) {
      await expect(messageOf(page, id), `message of #${id}`).toHaveText(partner.required);
    }
    // optional fields show no message
    await expect(messageOf(page, 'wpforms-4447-field_15')).toHaveCount(0);
    await expect(messageOf(page, 'wpforms-4447-field_2')).toHaveCount(0);
  });

  test('invalid e-mail format shows "Please enter a valid email address."', async ({ page }) => {
    await page.locator(`#${partner.emailId}`).fill('invalid-email');
    await submit(page).click();
    await expect(messageOf(page, partner.emailId)).toHaveText(partner.invalidEmail);
    // the e-mail message is the format one, not the "required" one
    await expect(messageOf(page, partner.emailId)).not.toHaveText(partner.required);
  });
});
