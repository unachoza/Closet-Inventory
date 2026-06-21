### challenges - Written 2026-06-7

decisions about databases and role level security and relational and sql vs firestore. decided on relational tables being very important, and supabase being the way to go 

React Race conditions, closing form and returning to overview before addItem posted to localStorage
https://framermotion.framer.website/documentation/introduction

when passing down props, is it better to write an inline function or create a function, and pass the function name

creating HOC / transposition
TextInputContainer into a compound component, which keeps the API flexible, declarative, and easy to extend (for instance, if you add icons, help text, or other sub-components later).

lots of form inputs re renders use memo for performance

Resize Observer
https://medium.com/@chamaraS/resizeobserver-for-react-developers-a91df3608944

Temu anti email scrapping pattern
Because the product data is baked into an image (not HTML elements), no DOM parser can extract individual items from this email format. This is a deliberate anti-scraping pattern Temu uses.

//CSS organization
positional formatting first,
followed by layout parameters,
then sizing
then colors
other text formatting properties.

.example-selector {
/_ Positioning _/
position: absolute;
top: 0;
left: 0;
z-index: 10;

/_ Display & Box Model _/
display: block;
width: 100%;
height: 200px;
padding: 1.25rem;
margin-bottom: 15px;
border: 1px solid #ccc;

/_ Visual Properties _/
background-color: #f0f0f0;
color: #333;
box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);

/_ Typography _/
font-family: sans-serif;
font-size: 16px;
line-height: 1.5;
text-align: center;

/_ Other _/
cursor: pointer;
}

Inner Soft Shadow Effect
https://www.codementor.io/@zara-z/how-to-make-an-inner-shadow-effect-with-css-1odkuw71cl
box-shadow: inset 6px 6px 10px 0 rgb(0,0,0, .5), inset -6px -6px 10px 0 rgb(255,255,255, .5)

////////////Playwrite config
import { defineConfig, devices } from '@playwright/test';

/\*\*

- Read environment variables from file.
- https://github.com/motdotla/dotenv
  \*/
  // import dotenv from 'dotenv';
  // import path from 'path';
  // dotenv.config({ path: path.resolve(\_\_dirname, '.env') });

/\*\*

- See https://playwright.dev/docs/test-configuration.
  _/
  export default defineConfig({
  testDir: './tests',
  /_ Run tests in files in parallel _/
  fullyParallel: true,
  /_ Fail the build on CI if you accidentally left test.only in the source code. _/
  forbidOnly: !!process.env.CI,
  /_ Retry on CI only _/
  retries: process.env.CI ? 2 : 0,
  /_ Opt out of parallel tests on CI. _/
  workers: process.env.CI ? 1 : undefined,
  /_ Reporter to use. See https://playwright.dev/docs/test-reporters _/
  reporter: 'html',
  /_ Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. _/
  use: {
  /_ Base URL to use in actions like `await page.goto('')`. \*/
  // baseURL: 'http://localhost:3000',

            /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
            trace: 'on-first-retry',

     },

/_ Configure projects for major browsers _/
projects: [
{
name: 'chromium',
use: { ...devices['Desktop Chrome'] },
},

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },

],

/_ Run your local dev server before starting the tests _/
// webServer: {
// command: 'npm run start',
// url: 'http://localhost:3000',
// reuseExistingServer: !process.env.CI,
// },
});

/////////////playwrite.yml
name: Playwright Tests
on:
push:
branches: [ main, master ]
pull_request:
branches: [ main, master ]
jobs:
test:
timeout-minutes: 60
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v4 - uses: actions/setup-node@v4
with:
node-version: lts/\* - name: Install dependencies
run: npm ci - name: Install Playwright Browsers
run: npx playwright install --with-deps - name: Run Playwright tests
run: npx playwright test - uses: actions/upload-artifact@v4
if: ${{ !cancelled() }}
with:
name: playwright-report
path: playwright-report/
retention-days: 30
