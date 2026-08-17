// Best-effort Chairish "connector."
//
// Chairish doesn't offer a public API, so this scrapes the public shop page
// (https://www.chairish.com/shop/michaelmillardlowe) and each product page's
// standard SEO tags (JSON-LD product schema when present, otherwise Open
// Graph / meta tags, which Chairish reliably sets). This is intentionally
// simple and dependency-light so it keeps working even if Chairish tweaks
// their page's internal CSS class names - those are NOT what this relies on.
//
// If Chairish changes their URL scheme (/product/<id>/<slug>) or stops
// setting these meta tags, this will need updating. Re-run any time with
// `npm run sync:chairish`.

const cheerio = require("cheerio");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      // Chairish sits behind Fastly, which actively screens for bots -
      // a request with only User-Agent and Accept (what this used to send)
      // looks nothing like a real browser's navigation request and is an
      // easy signal to flag, especially coming from a shared Vercel IP
      // range rather than a residential connection. Sending the same full
      // header set a real Chrome browser sends on a normal page load makes
      // this look far more like a real visit. This raises the odds of
      // getting through, but it's not a guarantee - Fastly can also
      // fingerprint things headers can't fake (TLS handshake details,
      // request timing/rate, IP reputation). If Vercel still gets blocked,
      // `npm run sync:chairish` from your own computer (a residential IP)
      // remains the most reliable fallback.
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      Referer: "https://www.google.com/",
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed for ${url}: ${res.status}`);
  }
  return res.text();
}

function absoluteChairishUrl(href) {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  return `https://www.chairish.com${href}`;
}

/** Find every /product/<id>/<slug> link on a shop listing page. */
function extractProductUrls(html) {
  const $ = cheerio.load(html);
  const urls = new Set();
  $('a[href*="/product/"]').each((_, el) => {
    const href = $(el).attr("href");
    const match = href && href.match(/\/product\/(\d+)\/([a-z0-9-]+)/i);
    if (match) {
      urls.add(`https://www.chairish.com/product/${match[1]}/${match[2]}`);
    }
  });
  return [...urls];
}

/**
 * Walks Chairish's shop pages by explicit ?page=N query param, up to
 * maxPages, stopping as soon as a page yields zero new product URLs.
 *
 * Earlier versions of this function only followed an `a[rel="next"]` /
 * "Next" text link, which silently stopped after page 1 on this shop's
 * page template (it doesn't render a Next link the way this assumed) -
 * that bug caused a real sync to miss ~2/3 of the shop's listings.
 * Chairish's own `?page=N` param reliably works when fetched directly
 * (confirmed against this shop's real 3-page, 133-item catalog), so
 * that's now the primary strategy. maxPages defaults well above the
 * shop's current page count so future inventory growth won't get cut off.
 */
async function collectShopProductUrls(shopUrl, maxPages = 10) {
  const all = new Set();
  const baseUrl = shopUrl.split("?")[0];
  // Specifically the reason page 1 failed, if it did - this is what tells
  // scrapeShop/the admin route the difference between "genuinely blocked"
  // and "reached the end of a shorter-than-expected catalog," which the
  // silently-swallowed error this used to have made impossible to surface
  // anywhere in the UI.
  let discoveryError = null;

  for (let page = 1; page <= maxPages; page += 1) {
    const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
    let html;
    try {
      html = await fetchHtml(url);
    } catch (err) {
      if (page === 1) discoveryError = err.message;
      break;
    }

    const found = extractProductUrls(html);
    const newUrls = found.filter((u) => !all.has(u));

    // First page is allowed to be "new" trivially; for page > 1, no new
    // URLs means we've run past the last real page - stop.
    if (page > 1 && newUrls.length === 0) break;

    found.forEach((u) => all.add(u));
  }

  return { urls: [...all], discoveryError };
}

function parseJsonLd($) {
  let product = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).contents().text());
      const roots = Array.isArray(json) ? json : [json];
      // Some sites nest their actual schema objects inside a top-level
      // "@graph" array instead of listing them directly - the old version
      // only ever checked the outer wrapper for "@type": "Product", so a
      // Product buried inside a @graph block would be silently missed even
      // though the data was right there. Flatten one level of @graph so
      // both shapes work the same way.
      const candidates = roots.flatMap((r) =>
        Array.isArray(r?.["@graph"]) ? r["@graph"] : [r]
      );
      for (const c of candidates) {
        if (c && c["@type"] === "Product") product = c;
      }
    } catch {
      // ignore malformed JSON-LD blocks
    }
  });
  return product;
}

function parsePrice($, jsonLd) {
  if (jsonLd && jsonLd.offers && jsonLd.offers.price) {
    return Number(jsonLd.offers.price);
  }

  const text = $("body").text();

  // Chairish product pages print a literal "Asking price: $X" - anchor on
  // that when present, since it's unambiguous. Without this anchor, the
  // naive "first $ amount on the page" fallback below can accidentally
  // grab a financing/installment figure (Affirm/Klarna-style "4 payments
  // of $X") that Chairish sometimes prints above the real price in the
  // page's text order, which would silently import the wrong price.
  const asking = text.match(/Asking [Pp]rice:?\s*\$?([\d,]+)/);
  if (asking) return Number(asking[1].replace(/,/g, ""));

  const match = text.match(/\$[\d,]+/);
  if (match) return Number(match[0].replace(/[$,]/g, ""));
  return null;
}

function parseDimensions(bodyText) {
  // Chairish shows dimensions like: 65"W x 27"D x 94"H - but not every
  // listing follows that exact order or has all three measurements.
  // Two-dimensional pieces (paintings, mirrors, rugs) often only give
  // width and height, and some listings order them differently
  // (e.g. 40"H x 30"W x 20"D). The old version hardcoded "W then D then
  // H/L" and returned nothing at all for anything that didn't match that
  // exact shape. This instead matches 2-3 "<number><W|D|H|L>" tokens
  // chained by x/×, in ANY order, and only fills in whichever axes were
  // actually present. H and L (length) are both treated as the "h" field,
  // matching this site's existing convention for pieces measured by
  // length instead of height.
  const axis = "([\\d.]+)\\W?(W|D|H|L)";
  const pattern = new RegExp(
    `${axis}\\s*[x×]\\s*${axis}(?:\\s*[x×]\\s*${axis})?`,
    "i"
  );
  const match = bodyText.match(pattern);
  if (!match) return { w: null, d: null, h: null, unit: "in" };

  const dims = { w: null, d: null, h: null };
  for (const i of [1, 3, 5]) {
    const value = match[i];
    const letter = match[i + 1];
    if (!value || !letter) continue;
    const axisKey =
      letter.toUpperCase() === "W"
        ? "w"
        : letter.toUpperCase() === "D"
        ? "d"
        : "h";
    dims[axisKey] = Number(value);
  }
  return { ...dims, unit: "in" };
}

function extractImageUrl(image) {
  // Chairish's JSON-LD "image" field isn't always a plain URL string - it
  // can be a single string, an array of strings, a schema.org ImageObject
  // ({ "@type": "ImageObject", url: "..." }), or an array of those. This
  // recurses through all of those shapes until it finds an actual URL
  // string, instead of assuming it's always a plain string (which is what
  // caused every single listing to fail with "heroImage.split is not a
  // function" once Chairish started using ImageObjects here).
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) {
    for (const item of image) {
      const url = extractImageUrl(item);
      if (url) return url;
    }
    return null;
  }
  if (typeof image === "object") {
    return image.url || image.contentUrl || null;
  }
  return null;
}

async function scrapeProduct(url) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const jsonLd = parseJsonLd($);

  const title =
    (jsonLd && jsonLd.name) ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").first().text().split("|")[0].trim();

  const description =
    (jsonLd && jsonLd.description) ||
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    "";

  const heroImage =
    extractImageUrl(jsonLd && jsonLd.image) ||
    $('meta[property="og:image"]').attr("content") ||
    null;

  const galleryImages = new Set();
  if (heroImage) {
    galleryImages.add(
      heroImage.split("?")[0] + "?aspect=fit&width=1200&height=1200"
    );
  }
  $('img[src*="chairish-prod.freetls.fastly.net/image/product"]').each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      galleryImages.add(src.split("?")[0] + "?aspect=fit&width=1200&height=1200");
    }
  });

  const price = parsePrice($, jsonLd);
  const bodyText = $("body").text().replace(/\s+/g, " ");
  const dimensions = parseDimensions(bodyText);

  const idMatch = url.match(/\/product\/(\d+)\//);

  return {
    title: title || "Untitled Item",
    description: description || "",
    price: price || 0,
    compareAtPrice: null,
    dimensions,
    condition: "Vintage / Antique",
    category: null, // auto-categorized on merge
    tags: [],
    era: "",
    origin: "",
    images: [...galleryImages],
    featured: false,
    status: "available",
    source: "chairish",
    sourceUrl: url,
    sourceProductId: idMatch ? idMatch[1] : null,
  };
}

async function scrapeShop(shopUrl, options) {
  // Defaults set well above this shop's current size (133 items across 3
  // pages) so a routine `npm run sync:chairish` picks up everything,
  // including future inventory growth, in one run.
  const { maxPages = 10, maxItems = 300, skipProductIds } = options || {};
  const { urls: allUrls, discoveryError } = await collectShopProductUrls(
    shopUrl,
    maxPages
  );

  // When a caller already knows which sourceProductIds it has (the admin
  // "Sync from Chairish" button, which is time-boxed to fit inside a
  // single Vercel function call and can't always scrape all ~133 items'
  // full detail pages in one click), skip those first so the limited
  // maxItems budget is spent on genuinely new/unseen items instead of
  // re-fetching the same handful every time. Without this, a capped
  // maxItems would always grab the same first N product URLs (Set
  // iteration order is stable) and the tail of the catalog would never
  // get reached no matter how many times the button is clicked.
  const prioritized = skipProductIds
    ? [
        ...allUrls.filter((u) => {
          const m = u.match(/\/product\/(\d+)\//);
          return !(m && skipProductIds.has(m[1]));
        }),
        ...allUrls.filter((u) => {
          const m = u.match(/\/product\/(\d+)\//);
          return m && skipProductIds.has(m[1]);
        }),
      ]
    : allUrls;

  const productUrls = prioritized.slice(0, maxItems);

  const results = [];
  const errors = [];
  if (discoveryError) {
    errors.push({ url: shopUrl, error: discoveryError });
  }

  for (const url of productUrls) {
    try {
      const product = await scrapeProduct(url);
      if (product.sourceProductId) results.push(product);
    } catch (err) {
      errors.push({ url, error: err.message });
    }
    // Be polite - avoid hammering Chairish.
    await new Promise((r) => setTimeout(r, 350));
  }

  // The full set of product IDs currently listed on the shop page, even
  // ones outside this run's maxItems detail-scrape budget. This is what
  // lets mergeScrapedListings figure out which of OUR previously-imported
  // items are no longer on Chairish at all (almost always because they
  // sold) - discovering the shop's listing pages is cheap (just page
  // fetches, no per-item detail fetch), so we always get the complete
  // picture here regardless of how small maxItems is.
  const activeProductIds = new Set(
    allUrls
      .map((u) => u.match(/\/product\/(\d+)\//))
      .filter(Boolean)
      .map((m) => m[1])
  );

  return { results, errors, activeProductIds };
}

module.exports = {
  extractProductUrls,
  collectShopProductUrls,
  scrapeProduct,
  scrapeShop,
};
