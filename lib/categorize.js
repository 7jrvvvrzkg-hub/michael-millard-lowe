// A lightweight, dependency-free "smart categorizer" for antiques.
//
// It reads each listing's title / description / tags and scores it against
// a keyword dictionary for every category, the same way a simple text
// classifier would. New listings added through the admin panel without a
// category chosen get auto-sorted by this. It also powers the homepage's
// "Shop by Category" section, which re-shuffles which categories & preview
// photos are shown every time the page reloads, so the front page always
// feels freshly curated.

const { CATEGORIES } = require("./constants");

const KEYWORDS = {
  furniture: [
    "armoire", "chair", "sofa", "canape", "settee", "desk", "table",
    "cabinet", "commode", "buffet", "bookcase", "credenza", "chest",
    "dresser", "bench", "stool", "secretary", "bed", "wardrobe",
    "sideboard", "console",
  ],
  lighting: [
    "sconce", "lamp", "chandelier", "candelabra", "candlestick",
    "candle holder", "light fixture", "pricket", "torchiere", "lantern",
  ],
  "art-mirrors": [
    "mirror", "painting", "portrait", "print", "drawing", "sculpture",
    "canvas", "artwork", "engraving", "photograph", "tapestry",
  ],
  decor: [
    "vase", "urn", "tray", "pedestal", "box", "jar", "bowl", "planter",
    "clock", "figurine", "statue", "plate", "frame", "basket", "screen",
    "obelisk", "server",
  ],
};

function scoreCategory(text, keywords) {
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) score += kw.includes(" ") ? 2 : 1;
  }
  return score;
}

function categorizeListing(listing) {
  const haystack = [listing.title, listing.description, ...(listing.tags || [])]
    .join(" ")
    .toLowerCase();

  let bestSlug = listing.category || "decor";
  let bestScore = -1;

  for (const cat of CATEGORIES) {
    const score = scoreCategory(haystack, KEYWORDS[cat.slug] || []);
    if (score > bestScore) {
      bestScore = score;
      bestSlug = cat.slug;
    }
  }

  if (bestScore <= 0 && listing.category) return listing.category;
  return bestSlug;
}

function categorizeAll(listings) {
  return listings.map((l) => ({
    ...l,
    category: l.category || categorizeListing(l),
  }));
}

// Deterministic-but-different-per-call shuffle (Fisher-Yates over a seed
// derived from the current time), used client-side so the category grid
// order changes on every reload without needing a server round trip.
function shuffle(array, seed = Date.now()) {
  const arr = [...array];
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom(array, seed = Date.now()) {
  if (!array.length) return null;
  const [first] = shuffle(array, seed);
  return first;
}

module.exports = {
  categorizeListing,
  categorizeAll,
  shuffle,
  pickRandom,
};
