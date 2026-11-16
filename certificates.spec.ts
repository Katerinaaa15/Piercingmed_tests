import { test, expect } from '@playwright/test';
import { HomePage, currentPath } from './pages/HomePage';

// "Certificates" page (/certificati/): every certificate is a button linking to a PDF.
const certificates = {
  path: '/certificati/',
  footerLinkText: 'Certificates',
  browserTitle: 'Certificates - PiercingMed',
  heading: 'Certificates',
  items: [
    { title: 'Titanium certificate', file: '/wp-content/uploads/2022/07/Certificate-Tremun.pdf' },
    { title: 'Kila Needles conformity', file: '/wp-content/uploads/certificati/kilaneedles-conformity.pdf' },
    { title: 'Kila Needles manual IT-EN-ES', file: '/wp-content/uploads/certificati/kilaneedles-Manual_EN.pdf' },
    { title: 'Certify Italian Tremun', file: '/wp-content/uploads/certificati/Tremun-Certificate-IT.pdf' },
  ],
};

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

  test('all certificates are listed with a download link to a PDF', async ({ page }) => {
    const links = page.locator('a[href$=".pdf"]');
    await expect(links).toHaveCount(certificates.items.length);
    for (const [i, item] of certificates.items.entries()) {
      await expect(page.getByText(new RegExp(`^\\s*${item.title}\\s*$`, 'i')), item.title).toBeVisible();
      await expect(links.nth(i)).toHaveAttribute('href', new RegExp(`${item.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
      await expect(links.nth(i)).toHaveAttribute('target', '_blank');
    }
  });

  // The correct files (without the "/staging" part of the path) exist and are PDFs.
  for (const item of certificates.items) {
    test(`correct link of "${item.title}" serves a PDF`, async ({ page }) => {
      const response = await page.request.get(item.file);
      expect(response.status(), item.file).toBe(200);
      expect(response.headers()['content-type']).toContain('application/pdf');
    });
  }

  // KNOWN SITE DEFECT: the download links point to /staging/wp-content/... which returns 404.
  // test.fail() turns red once the links are fixed: then remove test.fail() from these two tests.
  test('download links do not contain "/staging"', async ({ page }) => {
    test.fail(true, 'Certificate links contain /staging and lead to a 404 page');
    const hrefs = await page.locator('a[href$=".pdf"]').evaluateAll((a) => a.map((x) => (x as HTMLAnchorElement).href));
    expect(hrefs).toHaveLength(certificates.items.length);
    for (const [i, item] of certificates.items.entries()) {
      expect(hrefs[i], item.title).toBe(new URL(item.file, page.url()).href);
    }
  });

  for (const [i, item] of certificates.items.entries()) {
    test(`clicking "${item.title}" opens the PDF`, async ({ page }) => {
      test.fail(true, 'Certificate links contain /staging and lead to a 404 page');
      const popupPromise = page.waitForEvent('popup');
      const responsePromise = page.waitForResponse((r) => r.url().endsWith('.pdf'));
      await page.locator('a[href$=".pdf"]').nth(i).click();
      const popup = await popupPromise;
      const response = await responsePromise;
      await popup.close();
      expect(response.status(), response.url()).toBe(200);
      expect(response.url()).not.toContain('/staging');
    });
  }
});
