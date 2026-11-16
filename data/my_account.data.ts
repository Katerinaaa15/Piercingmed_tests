/** Test data for the My Account tests. Credentials come from .env (never hard-code them here). */

export const credentials = {
  username: process.env.USER_EMAIL ?? '',
  password: process.env.USER_PASSWORD ?? '',
};

export const myAccount = {
  path: '/my-account/',
  title: 'My account',
  lostPasswordPath: '/mio-account/lost-password/',
};

export const lostPassword = {
  /** The site answers with the same message for any address, so use one that does not exist (no e-mail is sent). */
  email: 'nonexistent.user.piercingmed.test@example.com',
  sentMessage: 'Your password reset email has been sent.',
};

export const loginErrors = {
  recaptcha: 'ERROR: Recaptcha Error',
};

// ---- Footer "My account" page (/mio-account/, no reCAPTCHA) and the logged-in area ----

export const footerAccount = {
  footerLinkText: 'My account',
  path: '/mio-account/',
  browserTitle: 'My Account - PiercingMed',
  title: 'My account',
  loginHeading: 'Sign in',
  labels: { username: 'Username or email address', password: 'Password', remember: 'Remember me' },
  signIn: 'Sign in',
  lostPassword: 'Forgot your password?',
};

export const footerLoginErrors = {
  noUsername: 'Error: Username is required.',
  noPassword: 'Error: The password field is empty.',
};

export const accountMenu = [
  { text: 'Noticeboard', path: '/mio-account/' },
  { text: 'Orders', path: '/mio-account/orders/' },
  { text: 'Download', path: '/mio-account/downloads/' },
  { text: 'Addresses', path: '/mio-account/edit-address/' },
  { text: 'Account Details', path: '/mio-account/edit-account/' },
];
export const logoutMenuText = 'You go out';

export const dashboardLinks = [
  { text: 'recent orders', path: '/mio-account/orders/' },
  { text: 'shipping and billing addresses', path: '/mio-account/edit-address/' },
  { text: 'change your password and account details', path: '/mio-account/edit-account/' },
];

export const orders = {
  columns: ['Order', 'Date', 'State', 'Total', 'Actions'],
  viewButton: 'View',
  viewPath: /\/mio-account\/view-order\/(\d+)\/$/,
  detailsHeading: 'Order details',
  tableHeads: ['Product', 'Total', 'Subtotal:', 'Shipping:', 'VAT:', 'Payment Method:', 'Total:'],
  addressHeadings: ['Billing address', 'Shipping address'],
};

export const accountDetails = {
  labels: [
    ['account_first_name', 'Name'],
    ['account_last_name', 'Surname'],
    ['account_display_name', 'Display Name'],
    ['account_email', 'Email address'],
    // the rest of these two labels is translated inconsistently ("to not change" / "to avoid changes"), so match the start
    ['password_current', 'Current password (leave blank to'],
    ['password_1', 'New password (leave blank to'],
    ['password_2', 'Confirm new password'],
    ['billing_fiscalcode', 'Tax ID code'],
    ['billing_vatcode', 'VAT number'],
    ['billing_recipientcode', 'Recipient Code'],
    ['billing_pec', 'PEC address'],
  ] as [string, string][],
  legends: ['Change password', 'Tax data'],
  saveButton: 'Save changes',
  requiredErrors: ['Name is a required field.', 'Last Name is a required field.'],
  passwordMismatch: 'The new passwords do not match.',
};

export const professionalPrice = {
  secretFaunaHref: '/categoria-prodotto/jewelry/secret-fauna/',
  piercingHref: '/categoria-prodotto/jewelry/',
  categoryName: 'Rings',
  text: 'Price for professionals',
};
