import ListingCard from "@/components/ListingCard";
import { getAllListings, getNewArrivals, getListingsByCategory } from "@/lib/listings";
import { CATEGORY_MAP } from "@/lib/constants";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }) {
  const info = CATEGORY_MAP[params.slug];
  const label =
    params.slug === "all"
      ? "All Antiques"
      : params.slug === "new-arrivals"
      ? "New Arrivals"
      : info?.label || "Antiques";
  return { title: label };
}

export default function CategoryPage({ params, searchParams }) {
  const { slug } = params;
  const saleOnly = searchParams?.sale === "1";

  let listings;
  let title;
  let description;

  if (slug === "all") {
    listings = getAllListings();
    title = "All Antiques";
    description = "Every piece currently available.";
  } else if (slug === "new-arrivals") {
    listings = getNewArrivals(48);
    title = "New Arrivals";
    description = "The most recently added pieces to the shop.";
  } else {
    const info = CATEGORY_MAP[slug];
    listings = getListingsByCategory(slug);
    title = info?.label || "Antiques";
    description = info?.description || "";
  }

  if (saleOnly) {
    listings = listings.filter(
      (l) => l.compareAtPrice && l.compareAtPrice > l.price
    );
    title = `Sale: ${title}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-espresso-950">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-sm text-espresso-600">
            {description}
          </p>
        )}
        <p className="mt-1 text-xs text-espresso-500">
          {listings.length} {listings.length === 1 ? "item" : "items"}
        </p>
      </div>

      {listings.length === 0 ? (
        <p className="rounded-xl bg-espresso-100/50 px-6 py-16 text-center text-sm text-espresso-600">
          No pieces here just yet &mdash; check back soon, or{" "}
          <a href="tel:+17577769046" className="font-semibold text-clay-600">
            call the shop
          </a>{" "}
          and ask what&rsquo;s on the way.
        </p>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard listing={listing} key={listing.id} />
          ))}
        </div>
      )}
    </div>
  );
}
