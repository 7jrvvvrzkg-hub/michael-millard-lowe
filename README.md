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
