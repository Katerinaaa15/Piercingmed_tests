import { test, expect } from '@playwright/test';
import { HomePage, currentPath } from './pages/HomePage';

// "Register as a reseller" (/registrati-come-rivenditore/). Every test: accept cookies, switch to
// English in the footer, click "Register as a reseller" in the footer menu.
const reseller = {
  path: '/registrati-come-rivenditore/',
  title: 'Register as a reseller - PiercingMed',
  heading: 'Register as a reseller',
  submit: 'Request registration as a reseller',
  required: 'Required field',
  privacy: 'I consent to the processing of personal data *',
  // field id -> English label (as translated by GTranslate; "Common" is the site's own translation of "Comune")
  fields: {
    first_name: 'Name',
    last_name: 'Surname',
    user_login: 'Email *',
    user_email: 'Repeat Email *',
    user_pass: 'Password *',
    ragione_sociale: 'Company Name *',
    p_iva: 'VAT number *',
    telefono: 'Telephone *',
    pec: 'PEC',
    sdi: 'SDI Code',
    AIPP_N: 'AIPP Card No.',
    stato: 'State *',
    postcode: 'ZIP Code *',
    provincia: 'Province (abbreviation) *',
    city: 'Common *',// "Comune" is the Italian word for "municipality" 
    indirizzo: 'Street and house number *',
    insta: 'Instagram Profile *',
  } as Record<string, string>,
  // mandatory fields that show a validation message when left empty
  mandatory: [
    'user_login', 'user_email', 'user_pass', 'ragione_sociale', 'p_iva', 'telefono', 'postcode',
    'provincia', 'city', 'indirizzo', 'insta', 'privacy_policy_1583164138',
  ],
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('Register as a reseller page', () => {
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    const link = home.footerLink('.widget_nav_menu', reseller.path);
    await link.scrollIntoViewIfNeeded();
    await expect(link).toHaveText('Register as a reseller');
    await link.click();
    await expect.poll(() => currentPath(page)).toBe(reseller.path);
  });

  test('footer link opens the page with the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(reseller.title);
    await expect(page.locator('h1')).toHaveText(reseller.heading, { ignoreCase: true });
  });

  test('all input fields have English labels', async ({ page }) => {
    for (const [id, text] of Object.entries(reseller.fields)) {
      await expect(page.locator(`form.register label[for="${id}"]`), `label of #${id}`)
        .toHaveText(new RegExp(`^\\s*${esc(text)}\\s*$`));
    }
    await expect(page.locator('form.register .field-privacy_policy')).toContainText(reseller.privacy);
    await expect(page.locator('form.register button[type="submit"]')).toHaveText(reseller.submit, { ignoreCase: true });
  });

  test('empty form shows "Required field" under each mandatory field', async ({ page }) => {
    const submit = page.locator('form.register button[type="submit"]');
    await submit.scrollIntoViewIfNeeded();
    await submit.click();
    for (const id of reseller.mandatory) {
      await expect(page.locator(`#${id}-error`), `validation message of #${id}`).toHaveText(reseller.required);
    }
    await expect(page.locator('label.user-registration-error')).toHaveCount(reseller.mandatory.length);
    await expect(page).toHaveURL(new RegExp(`${reseller.path}$`)); // form was not submitted
  });
});
