/** Test data for the checkout page checks (English version of the site). */

export const checkoutPage = {
  path: '/checkout/',
  /** The site's English title of the checkout page (machine-translated). */
  title: 'Earnings',
  qty: 2,
};

/**
 * The 3 buttons above the form. Their hrefs point to /staging/..., which the server redirects to the
 * production page; they open in a new tab.
 */
export const topButtons = [
  { label: 'JOIN AS A RESELLER', href: '/staging/mio-account/', expectedPath: '/mio-account/' },
  { label: 'DO YOU WANT TO BECOME A RESELLER?', href: '/staging/registrati-come-rivenditore/', expectedPath: '/registrati-come-rivenditore/' },
  { label: 'DO YOU WANT TO BECOME A COLLECTION POINT?', href: '/staging/registrati-come-partner/', expectedPath: '/registrati-come-partner/' },
];

/**
 * English names of the billing form fields: label `for` attribute -> start of the expected label
 * (a regex source, since the translator is inconsistent, e.g. "Province" / "Provinces"). The
 * trailing "*" / "(optional)" hint is not compared.
 */
export const fieldLabels: Record<string, string> = {
  billing_first_name: 'Name',
  billing_last_name: 'Surname',
  billing_company: 'Company name',
  billing_vatcode: 'VAT number',
  billing_recipientcode: 'SDI Code',
  billing_pecaddress: 'PEC address',
  billing_country: 'State',
  billing_address_1: 'Street and number',
  billing_city: 'City',
  billing_state: 'Provinces?',
  billing_postcode: 'ZIP Code',
  billing_phone: 'Telephone',
  billing_email: 'Email address',
  billing_sede_ritiro: 'Collection from Dealer',
  order_comments: 'Order Notes',
};

export const sectionTitles = ['Billing Details', 'Additional Information', 'Your order'];

export const shipping = {
  /** `id` of the shipping radio buttons and their fee in EUR (VAT incl.). */
  express: { id: 'shipping_method_0_flat_rate1', fee: 12.2 },
  cashOnDelivery: { id: 'shipping_method_0_flat_rate2', fee: 15.86 },
  pickupMonza: { id: 'shipping_method_0_local_pickup6', fee: 0 },
};

export const promo = {
  code: 'TESTPROMO',
  invalidMessage: 'The promotional code "testpromo" cannot be applied because it does not exist.',
};

/** Payment methods: radio value -> expected English label. */
export const paymentMethods: { value: string; label: RegExp }[] = [
  { value: 'bacs', label: /^Bank transfer$/i },
  { value: 'cheque', label: /^Direct remittance$/i },
  { value: 'ppcp', label: /^Credit card or PayPal account$/i },
];

/** English texts for the "Place order" button (the PayPal method labels it "Make payment"). */
export const placeOrderButton = /^(place order|make payment)$/i;

/** Validation messages expected in English after pressing "Place order" with every field empty. */
export const requiredMessages = [
  'Billing Name is a required field.',
  'Billing Last Name is a required field.',
  'Street and billing number is a required field.',
  'Billing City is a required field.',
  'Billing ZIP Code is a required field.',
  'Billing Phone is a required field.',
  'Billing email address is a required field.',
  'Read and accept the terms and conditions to proceed with the order.',
];
