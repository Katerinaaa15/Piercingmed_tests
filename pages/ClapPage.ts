import { expect, type Locator, type Page } from '@playwright/test';

/** CLAP! display page (Elementor). */
export class ClapPage {
  readonly page: Page;

  readonly video: Locator;
  readonly videoOverlay: Locator;

  readonly imageLinks: Locator;
  readonly lightbox: Locator;
  readonly lightboxImage: Locator;

  readonly storeButton: Locator;
  readonly categoryTitle: Locator;

  constructor(page: Page) {
    this.page = page;

    // The first (horizontal) video of the page: poster overlay + hosted <video>.
    this.video = page.locator('video.elementor-video').first();
    this.videoOverlay = page.locator('.elementor-custom-embed-image-overlay').first();

    this.imageLinks = page.locator('.elementor a[data-elementor-open-lightbox="yes"]');
    this.lightbox = page.locator('.dialog-lightbox-widget');
    this.lightboxImage = this.lightbox.locator('img.elementor-lightbox-image');

    this.storeButton = page.locator('.elementor a.elementor-button');
    this.categoryTitle = page.locator('h1').first();
  }

  /**
   * Heading of a given level by its text. Found by tag (not by role) because some headings stay
   * invisible until an Elementor scroll animation runs, so they are scrolled into view first.
   */
  heading(level: number, text: string | RegExp): Locator {
    return this.page.locator(`h${level}`).filter({ hasText: text }).first();
  }

  async scrollToHeading(level: number, text: string | RegExp): Promise<Locator> {
    const heading = this.heading(level, text);
    await heading.scrollIntoViewIfNeeded();
    return heading;
  }

  /** Is the video really playing (not paused, time moving, no media error)? */
  async videoState() {
    return this.video.evaluate((v: HTMLVideoElement) => ({
      playing: !v.paused && v.currentTime > 0 && !v.error,
      errorCode: v.error?.code ?? null,
      readyState: v.readyState,
    }));
  }

  async playVideo() {
    await this.videoOverlay.scrollIntoViewIfNeeded();
    await this.videoOverlay.click();
  }

  /** Click an image of the gallery (the first one of the first category). */
  async openFirstImage() {
    await this.imageLinks.first().scrollIntoViewIfNeeded();
    await this.imageLinks.first().click();
  }

  /** Natural width of the image shown in the lightbox (0 when the file failed to load). */
  async lightboxImageWidth(): Promise<number> {
    return this.lightboxImage.first().evaluate((img: HTMLImageElement) => img.naturalWidth).catch(() => 0);
  }

  async closeLightbox() {
    await this.page.keyboard.press('Escape');
    await expect(this.lightboxImage.first()).toBeHidden();
  }
}
