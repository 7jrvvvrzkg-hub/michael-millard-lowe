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

// Display order (Monday-first) for the storefront hours shown in the
// footer. Kept separate from the JSON-LD version below since schema.org's
// OpeningHoursSpecification wants days grouped by identical hours, not a
// day-by-day list.
const HOURS = [
  { day: "Monday", hours: "10 AM–5 PM" },
  { day: "Tuesday", hours: "10 AM–5 PM" },
  { day: "Wednesday", hours: "10 AM–5 PM" },
  { day: "Thursday", hours: "10 AM–5 PM" },
  { day: "Friday", hours: "10 AM–5 PM" },
  { day: "Saturday", hours: "10 AM–5 PM" },
  { day: "Sunday", hours: "12–5 PM" },
];

// schema.org-shaped hours for the homepage's LocalBusiness JSON-LD - grouped
// by identical opening/closing times rather than repeated per day.
const HOURS_SCHEMA = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    opens: "10:00",
    closes: "17:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Sunday"],
    opens: "12:00",
    closes: "17:00",
  },
];

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

module.exports = {
  BUSINESS,
  HOURS,
  HOURS_SCHEMA,
  CATEGORIES,
  CATEGORY_MAP,
  SEARCH_PROMPTS,
};
