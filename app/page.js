import Hero from "@/components/Hero";
import StorySection from "@/components/StorySection";
import CategoryGrid from "@/components/CategoryGrid";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";
import { getAllListings, getFeaturedListings, getNewArrivals } from "@/lib/listings";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const all = getAllListings();
  const featured = getFeaturedListings(8);
  const newArrivals = getNewArrivals(8);

  return (
    <>
      <Hero heroImage={featured[0]?.images?.[0]} />

      <StorySection />

      <CategoryGrid listings={all} />

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold text-espresso-950">
            Featured Pieces
          </h2>
          <Link
            href="/category/all"
            className="text-sm font-medium text-clay-600 hover:text-clay-500"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="listing-grid">
          {featured.map((listing, i) => (
            <ListingCard listing={listing} key={listing.id} priority={i < 4} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-semibold text-espresso-950">
            New Arrivals
          </h2>
          <Link
            href="/category/new-arrivals"
            className="text-sm font-medium text-clay-600 hover:text-clay-500"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="listing-grid">
          {newArrivals.map((listing) => (
            <ListingCard listing={listing} key={listing.id} />
          ))}
        </div>
      </section>
    </>
  );
}
