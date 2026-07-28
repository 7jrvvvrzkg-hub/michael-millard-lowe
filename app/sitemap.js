import { getAllListings } from "@/lib/listings";
import { CATEGORIES } from "@/lib/constants";

export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const listings = getAllListings();

  const staticRoutes = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/category/all`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/category/new-arrivals`, changeFrequency: "daily", priority: 0.8 },
    ...CATEGORIES.map((c) => ({
      url: `${siteUrl}/category/${c.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
    })),
  ];

  const listingRoutes = listings.map((l) => ({
    url: `${siteUrl}/listing/${l.id}`,
    lastModified: l.createdAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...listingRoutes];
}
