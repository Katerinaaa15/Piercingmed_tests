import { test, expect } from '@playwright/test';
import { HomePage, currentPath } from './pages/HomePage';
import { ClapPage } from './pages/ClapPage';
import { clapPage, headings, storeSection } from './data/clap.data';

// CLAP! display page checks. Every test starts by accepting cookies, switching to English
// (HomePage.open()) and clicking "CLAP!" in the top menu.
test.describe('CLAP! page', () => {
  let clap: ClapPage;

  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    clap = new ClapPage(page);
    await home.open();
    await home.menuLink(clapPage.menuHref).click();
    await expect.poll(() => currentPath(page)).toBe(clapPage.path);
  });

  test('CLAP! menu item opens the espositore-clap page', async ({ page }) => {
    await expect(page).toHaveTitle(clapPage.browserTitle);
    await expect(clap.heading(1, headings[0].text)).toBeVisible();
  });

  // KNOWN SITE DEFECT: the video file returns 404 (/staging/wp-content/uploads/.../Clap2024_720p.mp4),
  // so it never plays. test.fail() turns red once it is fixed (then remove test.fail()).
  test('clicking the video plays it', async () => {
    test.fail(true, 'The CLAP! video file is missing (404), the player reports a media error');
    await clap.playVideo();
    await expect.poll(async () => (await clap.videoState()).playing, { timeout: 10_000, message: 'video should be playing' }).toBe(true);
  });

  test('main headings and titles are displayed in English', async () => {
    for (const { level, text } of headings) {
      await expect(await clap.scrollToHeading(level, text), `heading "${text}"`).toBeVisible();
    }
    await expect(clap.page.getByText(storeSection.text)).toBeVisible();
  });

  // KNOWN SITE DEFECT: the gallery images (/staging/wp-content/uploads/.../Render_b2-scaled.jpg ...)
  // return 404, so the lightbox opens but shows a broken image.
  test('clicking a category image opens it in the lightbox', async () => {
    test.fail(true, 'The gallery image files are missing (404), the lightbox shows a broken image');
    await clap.openFirstImage();
    await expect(clap.lightboxImage.first()).toBeVisible();
    await expect.poll(() => clap.lightboxImageWidth(), { message: 'the lightbox image should load' }).toBeGreaterThan(0);
    await clap.closeLightbox();
  });

  test('"Go to the store" button opens the Clap! category', async ({ page }) => {
    await expect(clap.storeButton).toHaveText(storeSection.button, { ignoreCase: true });
    await expect(clap.storeButton).toHaveAttribute('href', new RegExp(`${storeSection.buttonHref}$`));
    await clap.storeButton.click();
    await expect.poll(() => currentPath(page)).toBe(storeSection.expectedPath);
    await expect(clap.categoryTitle).toHaveText(storeSection.categoryTitle, { ignoreCase: true });
  });
});
