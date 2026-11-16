import { test, expect, type Response } from '@playwright/test';
import { HomePage, currentPath } from './pages/HomePage';

// "Certificates" page (/certificati/): every certificate is a button that opens, in a new tab, either a PDF
// (Kila Needles) or the manufacturer's certificates page (Tremun).
const certificates = {
  path: '/certificati/',
  footerLinkText: 'Certificates',
  browserTitle: 'Certificates - PiercingMed',
  heading: 'Certificates',
  items: [
    { title: 'Titanium certificate', file: '/wp-content/uploads/2022/07/Certificate-Tremun.pdf', link: 'https://tremunpiercing.com/certificates/' },
    { title: 'Kila Needles conformity', file: '/wp-content/uploads/certificati/kilaneedles-conformity.pdf' },
    { title: 'Kila Needles manual IT-EN-ES', file: '/wp-content/uploads/certificati/kilaneedles-Manual_EN.pdf' },
    { title: 'Certify Italian Tremun', file: '/wp-content/uploads/certificati/Tremun-Certificate-IT.pdf', link: 'https://tremunpiercing.com/certificates/' },
  ],
};

const linkSelector = 'a[href$=".pdf"], a[href^="https://tremunpiercing.com/certificates"]';

test.describe('Certificates page', () => {
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.open(); // cookies + English
    const link = home.footerLink('.widget_nav_menu', certificates.path);
    await link.scrollIntoViewIfNeeded();
    await expect(link).toHaveText(certificates.footerLinkText);
    await link.click();
    await expect.poll(() => currentPath(page)).toBe(certificates.path);
  });

  test('page has the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(certificates.browserTitle);
    await expect(page.locator('h1')).toHaveText(certificates.heading, { ignoreCase: true });
  });

  test('all certificates are listed with a download link (PDF or manufacturer page)', async ({ page }) => {
    const links = page.locator(linkSelector);
    await expect(links).toHaveCount(certificates.items.length);
    for (const [i, item] of certificates.items.entries()) {
      await expect(page.getByText(new RegExp(`^\\s*${item.title}\\s*$`, 'i')), item.title).toBeVisible();
      const expected = item.link ?? new URL(item.file, page.url()).href;
      await expect(links.nth(i), item.title).toHaveAttribute('href', expected);
      expect(expected).not.toContain('/staging');
      await expect(links.nth(i)).toHaveAttribute('target', '_blank');
    }
  });

  // Each certificate opens its target in a new tab: a PDF or the manufacturer page.
  for (const [i, item] of certificates.items.entries()) {
    test(`clicking "${item.title}" opens ${item.link ? 'the manufacturer page' : 'the PDF'}`, async ({ page, context }) => {
      const expected = item.link ?? new URL(item.file, page.url()).href;
      // the target opens in a new tab, so listen to responses of the whole browser context
      const responses: Response[] = [];
      context.on('response', (r) => responses.push(r));
      const popupPromise = page.waitForEvent('popup');
      await page.locator(linkSelector).nth(i).click();
      const popup = await popupPromise;
      await popup.waitForLoadState('commit').catch(() => {}); // a PDF may not fire the usual load events
      await expect.poll(() => responses.some((r) => r.url() === expected), { message: `response for ${expected}` }).toBe(true);
      const response = responses.find((r) => r.url() === expected)!;
      expect(response.status(), expected).toBe(200);
      expect(response.url()).not.toContain('/staging');
      if (item.link) {
        expect(response.headers()['content-type']).toContain('text/html');
        await expect.poll(() => popup.url()).toContain('tremunpiercing.com/certificates');
        await expect(popup.locator('body')).not.toContainText(/page not found|404/i);
      } else {
        expect(response.headers()['content-type']).toContain('application/pdf');
      }
      await popup.close();
    });
  }
});
