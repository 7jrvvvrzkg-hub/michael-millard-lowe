"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DeleteListingButton from "@/components/admin/DeleteListingButton";
import { formatPrice } from "@/lib/listings";
import { CATEGORY_MAP } from "@/lib/constants";

// formatPrice/CATEGORY_MAP are imported directly here rather than passed in
// as props - functions (like formatPrice) can't cross the server->client
// component boundary in the App Router, only serializable data can.

function StatusBadge({ status }) {
  // Note: clay only has shades 400/500/600 defined in tailwind.config.js -
  // clay-100/clay-700 would silently render with no color at all (the same
  // "undefined shade" bug documented there), so "available" uses the
  // opacity-modified clay-400 tint instead of a shade that doesn't exist.
  const styles =
    status === "sold"
      ? "bg-green-100 text-green-700"
      : status === "hidden"
      ? "bg-espresso-100 text-espresso-500"
      : "bg-clay-400/10 text-clay-600";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

function matches(listing, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const haystack = [
    listing.title,
    listing.id,
    listing.source,
    listing.status,
    listing.category,
    CATEGORY_MAP[listing.category]?.label,
    listing.era,
    listing.origin,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function ListingsTable({ listings, emptyMessage }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-espresso-900/10 bg-white shadow-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-espresso-100/60 text-xs uppercase tracking-wide text-espresso-600">
          <tr>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-espresso-900/5">
          {listings.map((l) => (
            <tr key={l.id} className="align-middle">
              <td className="flex items-center gap-3 px-4 py-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-espresso-100">
                  {l.images?.[0] && (
                    <Image
                      src={l.images[0]}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  )}
                </div>
                <span className="max-w-[220px] truncate font-medium text-espresso-900">
                  {l.title}
                </span>
              </td>
              <td className="px-4 py-3 text-espresso-700">
                {CATEGORY_MAP[l.category]?.label || l.category}
              </td>
              <td className="px-4 py-3 text-espresso-900">
                {formatPrice(l.price)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={l.status} />
              </td>
              <td className="px-4 py-3 text-xs uppercase tracking-wide text-espresso-500">
                {l.source}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/edit/${l.id}`}
                    className="text-xs font-semibold text-clay-600 hover:text-clay-500"
                  >
                    Edit
                  </Link>
                  <DeleteListingButton id={l.id} title={l.title} />
                </div>
              </td>
            </tr>
          ))}
          {listings.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-espresso-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Lets the owner type a few letters instead of scrolling through a long
// table to find the one item they want to change - filters both the Sold
// and Active groups live, client-side, against everything already sent
// down from the server (title, category, era, origin, source, status, id).
export default function ListingsExplorer({ soldListings, activeListings }) {
  const [query, setQuery] = useState("");

  const filteredSold = useMemo(
    () => soldListings.filter((l) => matches(l, query)),
    [soldListings, query]
  );
  const filteredActive = useMemo(
    () => activeListings.filter((l) => matches(l, query)),
    [activeListings, query]
  );

  return (
    <div>
      <div className="relative mt-8 max-w-sm">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
        >
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search listings by title, category, era..."
          className="w-full rounded-full border border-espresso-900/15 bg-white py-2.5 pl-9 pr-4 text-sm outline-none ring-clay-500 focus:ring-2"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-espresso-400 hover:text-espresso-700"
          >
            Clear
          </button>
        )}
      </div>

      {query && (
        <p className="mt-2 text-xs text-espresso-500">
          {filteredSold.length + filteredActive.length} of{" "}
          {soldListings.length + activeListings.length} listings match
        </p>
      )}

      {filteredSold.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-serif text-xl font-semibold text-espresso-950">
              Sold
            </h2>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              {filteredSold.length}
            </span>
          </div>
          <ListingsTable listings={filteredSold} emptyMessage="" />
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 font-serif text-xl font-semibold text-espresso-950">
          Active Listings
        </h2>
        <ListingsTable
          listings={filteredActive}
          emptyMessage={
            query
              ? "No listings match that search."
              : "No active listings yet. Add your first one, or sync from Chairish."
          }
        />
      </div>
    </div>
  );
}
