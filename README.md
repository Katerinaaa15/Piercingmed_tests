# PiercingMed Playwright tests

End-to-end tests for https://piercingmed.com (Playwright + TypeScript, Chromium and Firefox).
Every test accepts the cookie banner and switches the site to English in the footer before it checks anything.

## Project structure

```
*.spec.ts        Tests, one file per site area:
                 homepage, shop_product_page, shopping_cart, checkout, my_account,
                 clap, dealers, resellers, partners, contacts, certificates
pages/           Page objects (locators and helpers): HomePage, ShopPage, CartPage, ...
data/            Test data and expected texts, one file per spec
explore/         Throw-away scripts used to inspect the site (gitignored)
playwright.config.ts   Base URL, browsers, timeouts, reporters
.env             Local credentials (gitignored, never committed)
.env.example     Template of .env (committed)
```

## Setup

```
npm install
npx playwright install
```

Then create your `.env` (see below).

## Running the tests

```
npm test                              # all tests, both browsers
npm run test:chromium                 # Chromium only
npm run test:firefox                  # Firefox only
npx playwright test dealers.spec.ts   # one file
npx playwright test -g "Logout"       # tests whose name matches
npx playwright test --headed          # watch the browser
npx playwright test --retries=0       # no retries, to see real flakiness
npm run report                        # open the HTML report
```

Some tests are marked `test.fail()` because of known site defects (for example the certificate
links containing `/staging`). They count as passed while the defect exists and turn red once it is fixed,
then the `test.fail()` line should be removed.

## Credentials (.env)

The My Account tests log in with a real account, so the credentials live in a `.env` file:

```
BASE_URL=https://piercingmed.com
USER_EMAIL=...
USER_PASSWORD=...
```

- `.env` contains the real credentials. It is **gitignored** and must never be committed.
- `.env.example` is committed instead. It only shows which variables are needed, with no real values.
- Team members: copy `.env.example` to `.env` and fill in the credentials that the team already knows
  (ask a colleague). Do not put credentials in the code or in `.env.example`.

Without `USER_EMAIL` / `USER_PASSWORD` the login tests are skipped.
