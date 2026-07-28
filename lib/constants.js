const BUSINESS = {
  name: "Michael Millard-Lowe Antiques",
  shortName: "Millard-Lowe",
  tagline: "European & American Antiques",
  address: "242 West 21st St, Norfolk, VA",
  addressLine1: "242 West 21st St",
  addressLine2: "Norfolk, VA 23517",
  phoneDisplay: "757.776.9046",
  phoneHref: "+17577769046",
  website: "millard-lowe.com",
  chairishUrl: "https://www.chairish.com/shop/michaelmillardlowe",
  instagramUrl: "https://www.instagram.com/",
  email: "info@millard-lowe.com",
};

// Canonical categories every listing is sorted into.
const CATEGORIES = [
  {
    slug: "furniture",
    label: "Furniture",
    description: "Case pieces, seating, desks & tables sourced from France and Italy.",
  },
  {
    slug: "lighting",
    label: "Lighting",
    description: "Sconces, lamps and chandeliers with real patina.",
  },
  {
    slug: "art-mirrors",
    label: "Art & Mirrors",
    description: "Portraits, paintings and gilded period mirrors.",
  },
  {
    slug: "decor",
    label: "Decor & Objects",
    description: "Vases, candlesticks, trays and small curiosities.",
  },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

// Phrases the header search bar cycles through, typewriter-style.
const SEARCH_PROMPTS = [
  "Louis XV chair",
  "bronze sconces",
  "French armoire",
  "gilt mirror",
  "Napoleon III desk",
  "porcelain vase",
  "marble pedestal",
  "antique candlesticks",
];

module.exports = { BUSINESS, CATEGORIES, CATEGORY_MAP, SEARCH_PROMPTS };
