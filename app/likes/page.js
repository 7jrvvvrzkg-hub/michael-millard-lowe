"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { useLikes } from "@/hooks/useLikes";

export default function LikesPage() {
  const { likes, hydrated } = useLikes();
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => setAllListings(data.listings || []))
      .catch(() => setAllListings([]))
      .finally(() => setLoading(false));
  }, []);

  const likedListings = allListings.filter((l) => likes.includes(l.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-semibold text-espresso-950">
        Your Likes
      </h1>
      <p className="mt-1 text-xs text-espresso-500">
        Saved to this browser &mdash; tap the heart on any piece to save it
        here.
      </p>

      {(!hydrated || loading) && (
        <div className="listing-grid mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-espresso-100" />
          ))}
        </div>
      )}

      {hydrated && !loading && likedListings.length === 0 && (
        <p className="mt-10 rounded-xl bg-espresso-100/50 px-6 py-16 text-center text-sm text-espresso-600">
          Nothing saved yet. Browse the{" "}
          <Link href="/category/all" className="font-semibold text-clay-600">
            full collection
          </Link>{" "}
          and tap the heart on anything you&rsquo;d like to remember.
        </p>
      )}

      {likedListings.length > 0 && (
        <div className="listing-grid mt-8">
          {likedListings.map((listing) => (
            <ListingCard listing={listing} key={listing.id} />
          ))}
        </div>
      )}
    </div>
  );
}
