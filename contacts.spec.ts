import { test, expect, type Page } from '@playwright/test';
import { HomePage, currentPath } from './pages/HomePage';

// "Contacts" (/contatti/), a WPForms contact form.
const contacts = {
  path: '/contatti/',
  title: 'Contact - PiercingMed',
  heading: 'Contacts',
  submit: 'Send',
  required: 'This field is required.',
  invalidEmail: 'Please enter a valid email address.',
  fields: {
    'wpforms-4071-field_0': 'Name',
    'wpforms-4071-field_0-last': 'Surname',
    'wpforms-4071-field_1': 'Email *',
    'wpforms-4071-field_2': 'Your Message *',
  } as Record<string, string>,
  privacyId: 'wpforms-4071-field_3_1',
  privacyLabel: 'I declare that I have read the Privacy Policy and consent to this site storing the information I submit so it can process my request.',
  emailId: 'wpforms-4071-field_1',
  // all of these are required (name and surname too, although their labels carry no asterisk)
  mandatory: ['wpforms-4071-field_0', 'wpforms-4071-field_0-last', 'wpforms-4071-field_1', 'wpforms-4071-field_2', 'wpforms-4071-field_3_1'],
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const submit = (page: Page) => page.locator('form.wpforms-form button[type="submit"]');
const visibleErrors = (page: Page) => page.locator('form.wpforms-form label.wpforms-error').filter({ visible: true });
/** The validation message of a field (WPForms: "<input id>-error", checkboxes use their name). */
const messageOf = (page: Page, id: string) => {
  const cb = id.match(/^wpforms-\d+-field_(\d+)_1$/);
  return page.locator(`label.wpforms-error[id="${cb ? `wpforms[fields][${cb[1]}][]` : id}-error"]`);
};

test.describe('Contacts page', () => {
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    const link = home.footerLink('.widget_nav_menu', contacts.path);
    await link.scrollIntoViewIfNeeded();
    await expect(link).toHaveText('Contacts');
    await link.click();
    await expect.poll(() => currentPath(page)).toBe(contacts.path);
    await expect(page.locator('form.wpforms-form')).toBeVisible();
  });

  test('page has the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(contacts.title);
    await expect(page.locator('h1')).toHaveText(contacts.heading, { ignoreCase: true });
  });

  test('all fields have English labels', async ({ page }) => {
    for (const [id, text] of Object.entries(contacts.fields)) {
      await expect(page.locator(`label[for="${id}"]`).first(), `label of #${id}`)
        .toHaveText(new RegExp(`^\\s*${esc(text)}\\s*$`));
    }
    await expect(page.locator(`label[for="${contacts.privacyId}"]`)).toContainText(contacts.privacyLabel);
    await expect(submit(page)).toHaveText(contacts.submit, { ignoreCase: true });
  });

  test('empty form shows "This field is required." under each field', async ({ page }) => {
    await submit(page).click();
    await expect(visibleErrors(page)).toHaveCount(contacts.mandatory.length);
    for (const id of contacts.mandatory) {
      await expect(messageOf(page, id), `message of #${id}`).toHaveText(contacts.required);
    }
  });

  test('invalid e-mail format shows "Please enter a valid email address."', async ({ page }) => {
    await page.locator(`#${contacts.emailId}`).fill('invalid-email');
    await submit(page).click();
    await expect(messageOf(page, contacts.emailId)).toHaveText(contacts.invalidEmail);
    // the e-mail message is the format one, not the "required" one
    await expect(messageOf(page, contacts.emailId)).not.toHaveText(contacts.required);
  });
});
