"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";
import { shuffle, pickRandom } from "@/lib/categorize";

// "Shop by Category" - re-sorts itself and swaps preview photos on every
// page load, so the categorizer feels alive rather than a static menu.
export default function CategoryGrid({ listings }) {
  const [order, setOrder] = useState(CATEGORIES);
  const [previews, setPreviews] = useState(() =>
    Object.fromEntries(
      CATEGORIES.map((c) => [
        c.slug,
        listings.find((l) => l.category === c.slug) || null,
      ])
    )
  );

  useEffect(() => {
    const seed = Date.now() + Math.floor(Math.random() * 100000);
    setOrder(shuffle(CATEGORIES, seed));

    const nextPreviews = {};
    CATEGORIES.forEach((c, i) => {
      const inCategory = listings.filter((l) => l.category === c.slug);
      nextPreviews[c.slug] = pickRandom(inCategory, seed + i * 97) ||
        inCategory[0] ||
        null;
    });
    setPreviews(nextPreviews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl font-semibold text-espresso-950">
          Shop by Category
        </h2>
        <span className="text-xs uppercase tracking-wide text-espresso-500">
          Curated fresh, every visit
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {order.map((cat) => {
          const preview = previews[cat.slug];
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-espresso-100 shadow-card transition-shadow hover:shadow-cardHover"
            >
              {preview?.images?.[0] ? (
                <Image
                  src={preview.images[0]}
                  alt={cat.label}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-espresso-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/70 via-espresso-950/10 to-transparent" />
              <span className="absolute bottom-3 left-3 font-serif text-base font-semibold text-parchment-50 drop-shadow">
                {cat.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
