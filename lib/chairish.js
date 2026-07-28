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
      Accept: "text/html,application/xhtml+xml",
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

/** Follows Chairish's "Next" pagination link on a shop page, up to maxPages. */
async function collectShopProductUrls(shopUrl, maxPages = 5) {
  const all = new Set();
  let url = shopUrl;
  let page = 0;

  while (url && page < maxPages) {
    const html = await fetchHtml(url);
    extractProductUrls(html).forEach((u) => all.add(u));

    const $ = cheerio.load(html);
    const nextHref = $('a[rel="next"], a:contains("Next")').first().attr("href");
    url = nextHref ? absoluteChairishUrl(nextHref) : null;
    page += 1;
  }

  return [...all];
}

function parseJsonLd($) {
  let product = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).contents().text());
      const candidates = Array.isArray(json) ? json : [json];
      for (const c of candidates) {
        if (c["@type"] === "Product") product = c;
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
  const match = text.match(/\$[\d,]+/);
  if (match) return Number(match[0].replace(/[$,]/g, ""));
  return null;
}

function parseDimensions(bodyText) {
  // Chairish shows dimensions like: 65"W x 27"D x 94"H
  const match = bodyText.match(
    /([\d.]+)\W?W\s*[x×]\s*([\d.]+)\W?D\s*[x×]\s*([\d.]+)\W?[HL]/i
  );
  if (!match) return { w: null, d: null, h: null, unit: "in" };
  return {
    w: Number(match[1]),
    d: Number(match[2]),
    h: Number(match[3]),
    unit: "in",
  };
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
    (jsonLd && (Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image)) ||
    $('meta[property="og:image"]').attr("content");

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
  const { maxPages = 5, maxItems = 60 } = options || {};
  const productUrls = (await collectShopProductUrls(shopUrl, maxPages)).slice(
    0,
    maxItems
  );

  const results = [];
  const errors = [];

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

  return { results, errors };
}

module.exports = {
  extractProductUrls,
  collectShopProductUrls,
  scrapeProduct,
  scrapeShop,
};
