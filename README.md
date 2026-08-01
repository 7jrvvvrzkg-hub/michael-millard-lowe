# Michael Millard-Lowe Antiques

A Depop-styled storefront for Michael Millard-Lowe Antiques (European &
American antiques, Norfolk, VA). Built with Next.js so it can live in a
GitHub repo and deploy straight to Vercel.

## What's inside

- **Storefront** - homepage with hero, a "Shop by Category" grid that
  reshuffles itself (and its preview photos) on every reload, category
  pages, a listing detail page, and search.
- **Fully responsive / mobile** - a proper phone layout throughout, plus a
  Depop-style bottom tab bar on mobile (Home / Shop / Likes / Call / Owner)
  that disappears on desktop, where the header nav takes over.
- **Animated search bar** in the header that types out example searches
  ("Louis XV chair", "bronze sconces", ...).
- **Sticky phone bar** pinned to the top of every page with a tap-to-call
  number, plus a sticky nav underneath it.
- **Likes** - tap the heart on any listing to save it. No customer account
  needed; it's saved to that visitor's browser and shown on `/likes`.
- **Offers** - a "Make an Offer" form on every listing (name, contact info,
  offer amount, optional message). Nothing here touches money - it just
  records the offer for you to review and gives you Accept / Counter /
  Decline buttons in `/admin/offers`, then you follow up by phone or email
  same as you would with a Chairish offer.
- **Listing grid that adapts to screen size** - always at least 2 columns
  on a phone; on tablets and desktops it auto-fills based on how wide the
  window actually is, so a big monitor shows noticeably more columns than a
  laptop rather than being capped at a fixed number.
- **Smart categorizer** (`lib/categorize.js`) - a small keyword-based
  classifier that auto-sorts new listings into Furniture / Lighting / Art &
  Mirrors / Decor & Objects if you don't pick a category yourself.
- **Owner admin panel** at `/admin` - password protected, add/edit/delete
  listings, mark items sold, review and respond to offers, and a "Sync from
  Chairish" button.
- **Chairish connector** (`lib/chairish.js`, `scripts/scrape-chairish.mjs`)
  - a best-effort scraper of your public Chairish shop, since Chairish has
    no public API.
- **SEO basics** - sitemap, robots.txt, Open Graph tags, and Product /
  LocalBusiness structured data.
- 12 real starter listings already pulled in from your live Chairish shop,
  with real photos and descriptions.

## Your admin login

```
URL:      /admin/login  (or click "Login" top-right on the site)
Password: Norfolk1820!Millard
```

**Change this before you go live** - see "Changing the admin password"
below. Treat the password like any other password; anyone who has it can
add, edit, and delete listings.

## Running it locally

You'll need [Node.js](https://nodejs.org) 18 or newer.

```bash
cd antique-shop
npm install
npm run dev
```

Open http://localhost:3000. A `.env.local` is already included with a
working password + session secret, so login works immediately. Listings you
add locally are saved straight to `data/listings.json` on disk.

## Putting it on GitHub

```bash
cd antique-shop
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

`.env.local` is in `.gitignore` on purpose - your password hash and session
secret won't be pushed to GitHub. You'll set them again as environment
variables in Vercel (next step).

## Deploying to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo
   you just pushed. Vercel auto-detects Next.js - no build settings to
   change.
2. Before the first deploy (or right after, then redeploy), add these
   **Environment Variables** in the Vercel project settings:

   | Name | Value |
   |---|---|
   | `ADMIN_PASSWORD_HASH` | copy from `.env.example` (or generate a new one, below) |
   | `SESSION_SECRET` | copy from `.env.example` (or generate a new one, below) |
   | `NEXT_PUBLIC_SITE_URL` | your real domain, e.g. `https://millard-lowe.com` |
   | `NEXT_PUBLIC_BUSINESS_PHONE` | `+17577769046` |
   | `NEXT_PUBLIC_BUSINESS_PHONE_DISPLAY` | `757.776.9046` |
   | `GITHUB_TOKEN` | see below - required for the admin panel to work on the live site |
   | `GITHUB_REPO` | `your-username/your-repo-name` |
   | `GITHUB_BRANCH` | `main` |
   | `STRIPE_SECRET_KEY` | see "Buy Now with Stripe" below - a test key works with no bank account |
   | `STRIPE_WEBHOOK_SECRET` | optional, see below - lets a sale auto-mark the listing sold |
   | `GOOGLE_SHEETS_WEBHOOK_URL` | see "Newsletter signups" below |

3. Deploy. Once it's live, point your domain at it from the Vercel
   dashboard (Settings -> Domains).

### Why `GITHUB_TOKEN`? (how listings get saved on the live site)

Vercel doesn't give a live site its own writable database or disk. So
instead of standing up a separate database, the admin panel writes changes
straight back to `data/listings.json` **in your GitHub repo** using the
GitHub API. Vercel is already watching that repo, so every save triggers a
normal auto-redeploy (usually under a minute) and the change goes live.

To enable it:

1. Go to <https://github.com/settings/tokens?type=beta> and create a
   **fine-grained personal access token**.
2. Give it access to only this one repository, with **Contents:
   Read and write** permission.
3. Copy the token into Vercel as `GITHUB_TOKEN`, and set `GITHUB_REPO` to
   `your-username/your-repo-name`.

Without this, the admin panel still works when you run the site with
`npm run dev` on your own computer (it just writes to the local file) - it's
only the *live, deployed* site that needs the token to save changes
permanently.

One limitation worth knowing: because saves go live via a redeploy, avoid
adding two listings back-to-back within the same ~60 seconds - let the first
one finish deploying first, or its change could get overwritten.

## Buy Now with Stripe

Each listing's page has a **Buy Now** button that opens a Stripe-hosted
checkout page, instead of routing every sale through a phone call. Stripe's
own cut is 2.9% + 30 cents per sale with no monthly fee - no Shopify-style
platform charge on top.

**To try it out (no bank account needed):**

1. Create a free Stripe account at <https://dashboard.stripe.com/register>.
2. Grab a **test mode** secret key from
   <https://dashboard.stripe.com/test/apikeys> (starts with `sk_test_`) and
   set it as `STRIPE_SECRET_KEY`.
3. That's it - Buy Now will open a real Stripe checkout page. Pay with
   Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC, any
   ZIP. No real money moves and no bank account is required in test mode.

**To auto-mark a listing "sold" the moment it's paid for:** in your Stripe
dashboard, go to Developers > Webhooks > Add endpoint, point it at
`https://yoursite.com/api/stripe-webhook`, subscribe to the
`checkout.session.completed` event, and copy the signing secret it gives you
into `STRIPE_WEBHOOK_SECRET`. Without this set, Buy Now still works - you'd
just mark the item sold by hand in `/admin` afterward.

**To go live and actually get paid:** in your Stripe dashboard, finish the
account activation flow (business details + a linked bank account for
payouts), then swap `STRIPE_SECRET_KEY` for your live secret key
(`sk_live_...`). Everything else works exactly the same.

## Newsletter signups (Google Sheet)

Every page has a "Get the monthly catalogue" email signup at the bottom.
There's no database involved - signups get appended as rows to a Google
Sheet you control, using a free trick called an Apps Script "Web app": a
tiny script attached to the Sheet that can receive a web request and write
a row.

**Setup (about 5 minutes):**

1. Create a new Google Sheet (or reuse one) - call it something like
   "Newsletter Subscribers." Row 1 can be headers: `Date`, `Email`.
2. In the Sheet, go to **Extensions > Apps Script**. Delete whatever's in
   the editor and paste this in:

   ```js
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var email = (e.parameter.email || "").trim();

     if (!email) {
       return ContentService.createTextOutput(
         JSON.stringify({ ok: false, error: "Missing email" })
       ).setMimeType(ContentService.MimeType.JSON);
     }

     sheet.appendRow([new Date(), email]);

     return ContentService.createTextOutput(
       JSON.stringify({ ok: true })
     ).setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Click **Deploy > New deployment**. Click the gear icon next to "Select
   type" and choose **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**. Google will ask you to authorize the script (it's
   yours, so this is safe) - approve it.
5. Copy the URL it gives you (ends in `/exec`) into `GOOGLE_SHEETS_WEBHOOK_URL`
   in `.env.local` and in your Vercel project's environment variables.

That's it - every signup on the site now lands as a new row in that Sheet,
with a timestamp. If you ever need to change where signups go, or want to
add more fields (name, interests, etc.), you'd add matching inputs to the
form in `components/NewsletterSignup.js` and read the extra
`e.parameter.<field>` values in the Apps Script.

**One limitation to know:** if you ever edit the Apps Script code after
deploying, you need to create a **new deployment** (or use "Manage
deployments > Edit > New version") for the changes to actually take effect
- just saving the script isn't enough.

## Analytics

`/admin/analytics` (linked from the dashboard) shows the most-viewed
listings, the most common search terms, which categories and eras get the
most attention, and every completed Stripe purchase with total revenue.
There's no third-party analytics service involved - views, searches, and
purchases get logged into `data/analytics.json`, the same GitHub-backed file
approach as your listings and offers.

One thing worth understanding: unlike listings (which you only edit
occasionally), page views happen constantly, and normally any commit to
your repo makes Vercel rebuild and redeploy the whole site. Redeploying on
every single visitor would be slow and unnecessary, so this project ships a
`vercel.json` that tells Vercel to skip the rebuild specifically when the
*only* file that changed is `data/analytics.json`. You shouldn't need to
touch it, but it's why analytics tracking doesn't trigger a flurry of
redeploys the way adding a listing does.

## One-click sync for a non-technical owner

A browser button can't reach out and run a program on the visitor's own
computer - that's a security boundary no website can cross, not something
fixable in code. So instead of asking a non-technical shop owner to open a
terminal and type `npm run sync:chairish`, there are real double-clickable
apps with the shop's own logo on them:

- **Mac:** `scripts/Sync From Chairish.app` - double-click it, a small
  window pops up asking "Sync new items from Chairish now?", click **Sync
  Now**, and a second window shows the result a few seconds later. No
  Terminal ever opens. It has a real custom icon (a white, glossy,
  modern-macOS-style squircle with the orange monogram on it) and can be
  dragged straight to the Dock.

  **First time only:** double-click `scripts/Fix First Time.command`
  once, before opening the app for the first time (see "About that Mac
  security warning" below for why).

- **Windows:** double-click `scripts/Sync From Chairish.hta` - it opens a
  small app window with the shop's logo and a **Sync Now** button. Click
  it, and the result shows right there in the window. Inside that window
  there's also an **Add icon to Desktop** button - click it once, and a
  proper icon (flat, rounded, Windows 11-style, with the orange monogram)
  shows up on the Desktop that can be right-clicked and pinned to the
  taskbar or Start menu.

Under the hood both apps run the same underlying sync logic as the
command-line version - `scripts/sync-chairish-core.sh` (Mac) and
`scripts/sync-chairish-core.bat` (Windows) - which checks for new/updated
Chairish listings, saves the result, and commits + pushes it to GitHub so
the live site updates automatically (usually within about a minute). The
old plain double-click scripts, `scripts/sync-double-click.command` (Mac)
and `scripts/sync-double-click.bat` (Windows), still work too if anyone
prefers a plain console window over the app - they run the exact same
logic underneath.

**The one-time setup this still needs** (do this once, before handing the
project off - not something the owner ever has to touch): their computer
needs Node.js installed, and this project folder needs to be a real `git
clone` of the GitHub repo with push access already configured (an SSH key
or saved credentials) so the script's automatic `git push` actually works.
Once that's done, every sync after that really is just a double-click.

### About that Mac security warning

Apps that aren't signed by a registered Apple developer (which costs $99/yr
and isn't worth it for a single internal tool like this) get blocked by
macOS in one of two ways:

- A **plain script** (like `.command` files) shows a normal "are you sure
  you want to open this?" prompt - right-click it and choose **Open** once,
  and it's approved from then on.
- A **full app bundle** like `Sync From Chairish.app`, though, can instead
  get flagged as *"is damaged and should be moved to the Trash"* - which
  looks much scarier, and, unlike the prompt above, doesn't show up
  anywhere in System Settings to approve. It isn't actually damaged; this
  is macOS's download-quarantine flag reacting more strictly to an
  unsigned app bundle specifically.

That's exactly what `scripts/Fix First Time.command` fixes: double-click it
once (it's a plain script, so it'll show the normal, approvable prompt -
right-click it and choose **Open**), and it clears that flag from
everything in the folder. After that, `Sync From Chairish.app` opens
normally with a double-click, every time, no further warnings.

This doesn't replace the "Sync from Chairish" button already in `/admin` -
that one still runs from Vercel's servers and may occasionally get blocked
by Chairish (see the note it shows when that happens). Treat the desktop
app as the reliable way to sync, and the website button as a nice-to-have
that sometimes saves a step.

## Changing the admin password

```bash
cd antique-shop
npm run hash-password -- "your new password"
```

Copy the printed value into `ADMIN_PASSWORD_HASH` in `.env.local` (for
local dev) and in your Vercel project's environment variables (for the live
site), then redeploy.

## Syncing new items from Chairish

Chairish doesn't have a public API, so this project includes a scraper that
reads your public shop page (title, price, photos, description) and merges
anything new or changed into `data/listings.json`.

**Recommended:** run it from your own computer, since it uses your
machine's network connection rather than Vercel's:

```bash
cd antique-shop
npm run sync:chairish
git add data/listings.json
git commit -m "Sync listings from Chairish"
git push
```

There's also a "Sync from Chairish" button in `/admin` that tries the same
thing from the live server - it's a nice convenience, but some sites are
stricter about requests coming from cloud servers, so if it fails, fall back
to the command above.

Chairish can change their page's markup at any time, which could break the
scraper. It's built to be resilient (it reads standard SEO tags rather than
guessing at CSS class names), but if it ever stops finding items, that's the
most likely reason - it will need a small update to `lib/chairish.js`.

## Editing site details

- **Phone number, address, categories, search-bar phrases**:
  `lib/constants.js`
- **Colors / fonts**: `tailwind.config.js`
- **Favicon / logo**: `public/favicon.ico`, `public/logo-mark.png`,
  `public/apple-touch-icon.png` - all generated from the logo you provided.
  Swap them out any time by replacing the files (keep the same names and
  roughly the same sizes: favicon.ico multi-size, logo-mark.png 192x192,
  apple-touch-icon.png 180x180).

## A couple of honest notes

- **This isn't a payment/checkout site.** Given it's a single-owner antique
  shop, listings work like Chairish/1stDibs: buyers call or email to
  inquire, rather than checking out online. That also means there's nothing
  here that touches money, which keeps things simple and safe.
- **The "AI categorization"** is a fast, free, keyword-based classifier
  rather than a paid AI API call on every page load - it re-sorts and
  reshuffles the homepage category tiles on each visit without needing an
  API key or incurring any cost. If you'd rather wire it up to a real LLM
  call later, `lib/categorize.js` is the place to swap it in.
- **Photos currently in the site** are pulled from your live Chairish
  listings (with credit implied by the "Shop on Chairish" links throughout).
  Swap in your own photography any time via the admin panel.
- **Likes are per-browser, not per-person.** Since there's no customer
  login system, "likes" are stored in that visitor's browser
  (`localStorage`) rather than tied to an account. That means likes won't
  follow someone from their phone to their laptop - which is the tradeoff
  for not making people create an account just to save a chair they like.
- **Offers write to `data/offers.json`** the same way listings write to
  `data/listings.json` (see "Why GITHUB_TOKEN?" above) - the same token
  covers both files since it's scoped to the whole repo.
