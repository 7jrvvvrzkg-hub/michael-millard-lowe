// Read-side helpers. These read from the bundled data/listings.json, which
// is the site's "database" (see lib/admin-listings.js for how the admin
// panel writes to it). Safe to import from Server Components.

import rawListings from "@/data/listings.json";
import { categorizeListing } from "./categorize";

function normalize(listing) {
  return {
    ...listing,
    category: listing.category || categorizeListing(listing),
    images: listing.images && listing.images.length ? listing.images : [],
    status: listing.status || "available",
  };
}

export function getAllListings() {
  return rawListings.map(normalize).filter((l) => l.status !== "hidden");
}

export function getAllListingsIncludingHidden() {
  return rawListings.map(normalize);
}

export function getListingById(id) {
  return getAllListingsIncludingHidden().find((l) => l.id === id) || null;
}

export function getListingsByCategory(slug) {
  return getAllListings().filter((l) => l.category === slug);
}

export function getFeaturedListings(limit = 8) {
  const all = getAllListings();
  const featured = all.filter((l) => l.featured);
  const rest = all.filter((l) => !l.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function getNewArrivals(limit = 8) {
  return [...getAllListings()]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

export function getRelatedListings(listing, limit = 4) {
  return getAllListings()
    .filter((l) => l.id !== listing.id && l.category === listing.category)
    .slice(0, limit);
}

export function searchListings(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  return getAllListings().filter((l) => {
    const haystack = [
      l.title,
      l.description,
      l.era,
      l.origin,
      ...(l.tags || []),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

export function formatPrice(price) {
  if (typeof price !== "number") return "";
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatDimensions(dimensions) {
  if (!dimensions) return "";
  const { w, d, h, unit = "in" } = dimensions;
  const parts = [];
  if (w) parts.push(`${w}"W`);
  if (d) parts.push(`${d}"D`);
  if (h) parts.push(`${h}"H`);
  return parts.join(" x ").replace(/"/g, unit === "in" ? "ʺ" : `"`);
}
