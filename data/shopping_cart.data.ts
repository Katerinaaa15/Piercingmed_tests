/** Test data for the add-to-cart / shopping cart tests (English version of the site). */

export const product = {
  name: 'Akasha',
  /** Direct URL, used by tests that are not about navigating to the product. */
  path: '/prodotto/akasha/',
  /** Menu path used to reach the product: Piercing > Tremun Piercing > Attachments. */
  piercingHref: '/categoria-prodotto/jewelry/',
  tremunHref: '/categoria-prodotto/jewelry/tremun-piercing/',
  attachmentsHref: '/categoria-prodotto/jewelry/tremun-piercing/attachments/',
  unitPrice: 25.0,
};

export const cart = {
  path: '/carrello/',
  initialQty: 2,
  /** Prices are VAT-inclusive with hidden decimals (3 x 25.00 is shown as 74.99), so compare with a tolerance. */
  priceTolerance: 0.02,
};

export const promo = {
  code: 'TESTPROMO',
  /** WooCommerce lower-cases the code in its message. */
  invalidMessage: 'The promotional code "testpromo" cannot be applied because it does not exist.',
};
