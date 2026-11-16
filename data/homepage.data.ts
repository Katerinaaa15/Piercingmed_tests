/** Expected link targets on the English version of the PiercingMed homepage. Paths are relative to the base URL. */

export interface LinkCase {
  name: string;
  /** href (as authored in the page) used to locate the link; stable across translations. */
  href: string;
  /** Pathname expected after the click (redirects are followed). */
  expectedPath: string;
}

/** Top-level main menu items. `label` is the English text produced by the GTranslate widget. */
export const mainMenu: (LinkCase & { label: string })[] = [
  { name: 'Who We Are', label: 'Who We Are', href: '/chi-siamo/', expectedPath: '/chi-siamo/' },
  { name: 'Piercing', label: 'Piercing', href: '/categoria-prodotto/jewelry/', expectedPath: '/categoria-prodotto/jewelry/' },
  { name: 'Sharp', label: 'Sharp', href: '/categoria-prodotto/needles/', expectedPath: '/categoria-prodotto/needles/' },
  { name: 'Equipment', label: 'Equipment', href: '/categoria-prodotto/tools/', expectedPath: '/categoria-prodotto/tools/' },
  { name: 'Aftercare', label: 'Aftercare', href: '/categoria-prodotto/aftercare/', expectedPath: '/categoria-prodotto/aftercare/' },
  { name: 'Hygiene', label: 'Hygiene', href: '/categoria-prodotto/hygiene-and-supplies/', expectedPath: '/categoria-prodotto/hygiene-and-supplies/' },
  { name: 'CLAP!', label: 'CLAP!', href: '/espositore-clap/', expectedPath: '/espositore-clap/' },
  { name: 'Offers', label: 'Offers', href: '/offerte/', expectedPath: '/offerte/' },
];

/** Dropdown sub-menus: parent menu href -> children hrefs. */
export const subMenus: { parentName: string; parent: string; children: string[] }[] = [
  {
    parentName: 'Piercing',
    parent: '/categoria-prodotto/jewelry/',
    children: [
      '/categoria-prodotto/jewelry/tremun-piercing/',
      '/categoria-prodotto/jewelry/tremun-gold-jewelry/',
      '/categoria-prodotto/jewelry/tremun-premium-jewelry/',
      '/categoria-prodotto/jewelry/shanga-jewelry/',
      '/categoria-prodotto/jewelry/tremung-18k/',
      '/categoria-prodotto/jewelry/secret-fauna/',
    ],
  },
  {
    parentName: 'Sharp',
    parent: '/categoria-prodotto/needles/',
    children: [
      '/categoria-prodotto/needles/advanced-needles/',
      '/categoria-prodotto/needles/dermal-punch-needles/',
      '/categoria-prodotto/needles/kila-needles/',
    ],
  },
  {
    parentName: 'Equipment',
    parent: '/categoria-prodotto/tools/',
    children: [
      '/categoria-prodotto/tools/accessories/',
      '/categoria-prodotto/tools/anodizzazione-tools/',
      '/categoria-prodotto/tools/espositori-tools/',
      '/categoria-prodotto/tools/pinze-tools/',
    ],
  },
  {
    parentName: 'Hygiene',
    parent: '/categoria-prodotto/hygiene-and-supplies/',
    children: [
      '/categoria-prodotto/hygiene-and-supplies/disinfezione-hygiene-and-supplies/',
      '/categoria-prodotto/hygiene-and-supplies/monouso-hygiene-and-supplies/',
      '/categoria-prodotto/hygiene-and-supplies/sterilizzazione-hygiene-and-supplies/',
    ],
  },
];

export const heroButton: LinkCase = { name: 'Discover our products', href: '/negozio', expectedPath: '/negozio/' };

/** Promo banners (relative hrefs as authored in the page). */
export const banners: LinkCase[] = [
  { name: 'Jewelry banner', href: '/categoria-prodotto/jewelry/', expectedPath: '/categoria-prodotto/jewelry/' },
  { name: 'Dermal banner', href: '/tag-prodotto/dermal/', expectedPath: '/tag-prodotto/dermal/' },
  { name: 'Aftercare banner', href: '/categoria-prodotto/aftercare/', expectedPath: '/categoria-prodotto/aftercare/' },
  { name: 'CLAP display banner', href: '/espositore-clap/', expectedPath: '/espositore-clap/' },
  { name: 'Aftercare page banner', href: '/aftercare-page/', expectedPath: '/aftercare-page/' },
  { name: 'Autoclave banner', href: '/autoclave-sterihero/', expectedPath: '/autoclave-sterihero/' },
  { name: 'Tremun brand banner', href: '/brand/tremun/', expectedPath: '/brand/tremun/' },
  { name: 'Secret Fauna banner', href: '/categoria-prodotto/jewelry/secret-fauna/', expectedPath: '/categoria-prodotto/jewelry/secret-fauna/' },
  { name: 'Shanga banner', href: '/shanga-piercing/', expectedPath: '/shanga-piercing/' },
];

/**
 * Reseller / partner buttons. Their hrefs point to /staging/... which the server redirects (301)
 * to the production page, so the assertion is on the final URL.
 */
export const resellerButtons: (LinkCase & { label: string })[] = [
  { name: 'Dealer Map', label: 'Dealer Map', href: '/staging/rivenditori/', expectedPath: '/rivenditori/' },
  { name: 'Request reseller access', label: 'Request reseller access', href: '/staging/registrati-come-rivenditore/', expectedPath: '/registrati-come-rivenditore/' },
  { name: 'Reseller account', label: 'I already have a reseller account', href: '/staging/mio-account/', expectedPath: '/mio-account/' },
  { name: 'Become a partner', label: 'BECOME A PARTNER-SHOP', href: '/staging/registrati-come-partner/', expectedPath: '/registrati-come-partner/' },
];

/** "Some of our brands" slider (unique brand slugs). */
export const brands = ['auris-jewelry', 'electric-ink', 'gima', 'kai-medical', 'kila-needles', 'lomb-h', 'secret-fauna', 'shanga-gioielli', 'tremun'];

/** "Product categories" slider. */
export const productCategories: (LinkCase & { label: string })[] = [
  { name: 'Hygiene and supplies', label: 'Hygiene and supplies', href: '/categoria-prodotto/hygiene-and-supplies/', expectedPath: '/categoria-prodotto/hygiene-and-supplies/' },
  { name: 'Jewelry', label: 'Jewelry', href: '/categoria-prodotto/jewelry/', expectedPath: '/categoria-prodotto/jewelry/' },
  { name: 'Needles', label: 'Needles', href: '/categoria-prodotto/needles/', expectedPath: '/categoria-prodotto/needles/' },
  { name: 'Tools', label: 'Tools', href: '/categoria-prodotto/tools/', expectedPath: '/categoria-prodotto/tools/' },
  { name: 'Aftercare', label: 'Aftercare', href: '/categoria-prodotto/aftercare/', expectedPath: '/categoria-prodotto/aftercare/' },
  { name: 'Jewels', label: 'Jewels', href: '/categoria-prodotto/gioielli/', expectedPath: '/categoria-prodotto/gioielli/' },
];

/** Footer links, grouped by the widget that contains them. */
export const footerLinks: (LinkCase & { label: string; widget: string })[] = [
  { widget: '#nav_menu-2', name: 'Shipping and returns', label: 'Shipping and returns', href: '/spedizioni-e-resi/', expectedPath: '/spedizioni-e-resi/' },
  { widget: '#nav_menu-2', name: 'Payment Methods', label: 'Payment Methods', href: '/metodi-di-pagamento/', expectedPath: '/metodi-di-pagamento/' },
  { widget: '#nav_menu-2', name: 'Terms and conditions', label: 'Terms and conditions', href: '/termini-e-condizioni/', expectedPath: '/termini-e-condizioni/' },
  { widget: '#nav_menu-3', name: 'Certificates', label: 'Certificates', href: '/certificati/', expectedPath: '/certificati/' },
  { widget: '#nav_menu-3', name: 'Register as a reseller', label: 'Register as a reseller', href: '/registrati-come-rivenditore/', expectedPath: '/registrati-come-rivenditore/' },
  { widget: '#nav_menu-3', name: 'Register as a partner', label: 'Register as a partner', href: '/registrati-come-partner/', expectedPath: '/registrati-come-partner/' },
  { widget: '#nav_menu-3', name: 'Map of Dealers', label: 'Map of Dealers', href: '/rivenditori/', expectedPath: '/rivenditori/' },
  { widget: '#nav_menu-3', name: 'My account', label: 'My account', href: '/mio-account/', expectedPath: '/mio-account/' },
  { widget: '#nav_menu-4', name: 'Contacts', label: 'Contacts', href: '/contatti/', expectedPath: '/contatti/' },
  { widget: '#nav_menu-4', name: 'Privacy Policy', label: 'Privacy Policy', href: '/privacy-policy-2/', expectedPath: '/privacy-policy-2/' },
  { widget: '#nav_menu-4', name: 'Cookie Policy', label: 'Cookie Policy', href: '/cookie-policy/', expectedPath: '/cookie-policy/' },
  { widget: '#nav_menu-4', name: 'Company Data', label: 'Company Data', href: '/dati-societari/', expectedPath: '/dati-societari/' },
];

export const contact = {
  phoneHref: 'tel:+393755593422',
  phoneText: '+39 375 559 3422',
  emailHref: 'mailto:info@piercingmed.com',
  emailText: 'info@piercingmed.com',
  whatsappPhone: '393755593422',
  instagram: 'https://www.instagram.com/piercingmed/',
};

export const search = {
  term: 'ring',
  noResultsTerm: 'zzqxqxnotfound',
};
