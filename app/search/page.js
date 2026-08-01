import ListingCard from "@/components/ListingCard";
import { searchListings } from "@/lib/listings";
import { recordSearch } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }) {
  const q = searchParams?.q || "";
  const results = q ? searchListings(q) : [];
  if (q) await recordSearch(q);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-espresso-950">
        {q ? (
          <>
            Results for &ldquo;{q}&rdquo;
          </>
        ) : (
          "Search"
        )}
      </h1>
      <p className="mt-1 text-xs text-espresso-500">
        {q ? `${results.length} ${results.length === 1 ? "item" : "items"}` : "Type in the search bar above to get started."}
      </p>

      {q && results.length === 0 && (
        <p className="mt-10 rounded-xl bg-espresso-100/50 px-6 py-16 text-center text-sm text-espresso-600">
          Nothing matched that search. Try a broader term like &ldquo;chair&rdquo;
          or &ldquo;lamp&rdquo;, or{" "}
          <a href="tel:+17577769046" className="font-semibold text-clay-600">
            call the shop
          </a>{" "}
          &mdash; we may have it in-store and not yet listed.
        </p>
      )}

      {results.length > 0 && (
        <div className="listing-grid mt-8">
          {results.map((listing) => (
            <ListingCard listing={listing} key={listing.id} />
          ))}
        </div>
      )}
    </div>
  );
}
