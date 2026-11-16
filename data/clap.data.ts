/** Test data for the CLAP! display page (English version of the site). */

export const clapPage = {
  menuHref: '/espositore-clap/',
  path: '/espositore-clap/',
  /** The page title in the browser tab. */
  browserTitle: /CLAP Display/,
};

/** Headings expected on the page (visible text, English). */
export const headings: { level: number; text: string | RegExp }[] = [
  { level: 1, text: 'CLAP: the ultimate display for your studio' },
  { level: 3, text: 'Make your own B/W color combinations' },
  { level: 2, text: 'CLAP! Transparent Display for Terminals' },
  { level: 2, text: /We.ve created the perfect display/ },
  { level: 3, text: 'STYLE' },
  { level: 3, text: 'FUNCTIONAL' },
  { level: 3, text: 'UNIQUE' },
  { level: 2, text: 'What are you waiting for to buy it?' },
  { level: 3, text: 'BUY NOW' },
  { level: 3, text: 'CLAP Black Display Stand - 12 Holes' },
  { level: 3, text: 'CLAP White Display Stand - 12 Holes' },
];

/** The "Discover our displays with their accessories" text and its button. */
export const storeSection = {
  text: 'Discover our displays with their accessories',
  button: 'GO TO THE STORE',
  buttonHref: '/categoria-prodotto/tools/espositori-tools/clap-espositori-tools/',
  expectedPath: '/categoria-prodotto/tools/espositori-tools/clap-espositori-tools/',
  /** Title of the category page the button leads to. */
  categoryTitle: 'Clap!',
};
