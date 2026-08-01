import Link from "next/link";
import Image from "next/image";
import { getAllListings, formatPrice } from "@/lib/listings";
import { BUSINESS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsletter Preview" };

function pickRandom(items, count) {
  // Fisher-Yates shuffle, then take the first `count` - re-run on every
  // request (dynamic = "force-dynamic" above disables caching for this
  // page) so the preview shows a different set of pieces each time you
  // load it.
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// A live, on-site demo of what the monthly catalogue EMAIL (see
// /newsletter/catalogue-template.html in the project files) looks like once
// it's actually filled in with real listings - same layout and branding,
// rendered here with a random sample of the site's current listings
// instead of placeholder text. This page itself isn't the email; it's a
// working preview so you can see the design with real content.
export default function NewsletterPreviewPage() {
  const forSale = getAllListings().filter((l) => l.status !== "sold");
  const items = pickRandom(forSale, 6);
  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-espresso-500">
        Newsletter Preview
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-espresso-900/10 bg-white shadow-card">
        {/* Header */}
        <div className="bg-espresso-950 px-8 py-9 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-parchment-50 ring-2 ring-clay-500/40">
            <Image
              src="/logo-mark.png?v=2"
              alt={BUSINESS.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-parchment-50 sm:text-3xl">
            This Month&rsquo;s New Arrivals
          </h1>
          <p className="mt-1 text-sm text-parchment-200">{monthLabel}</p>
        </div>

        {/* Intro */}
        <div className="px-8 pb-2 pt-7">
          <p className="text-sm leading-relaxed text-espresso-800">
            A fresh set of pieces just arrived in the shop this month -
            sourced, as always, in France and Italy. Click any piece below
            to see full photos, dimensions, and price, or to buy it
            outright.
          </p>
        </div>

        {/* Item grid */}
        <div className="grid grid-cols-2 gap-4 px-6 py-6 sm:gap-5">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/listing/${item.id}`}
              className="group block"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-xl bg-espresso-100">
                {item.images?.[0] && (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 45vw, 280px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="mt-2.5 truncate text-sm font-semibold text-espresso-950">
                {item.title}
              </p>
              <p className="text-xs text-clay-600">{formatPrice(item.price)}</p>
            </Link>
          ))}
          {items.length === 0 && (
            <p className="col-span-2 py-10 text-center text-sm text-espresso-500">
              Add a few listings to see them show up here.
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="px-8 pb-9 pt-2 text-center">
          <Link
            href="/"
            className="inline-block rounded-full bg-espresso-950 px-8 py-3 text-sm font-semibold text-parchment-50 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-cardHover"
          >
            Shop the Full Collection
          </Link>
        </div>

        {/* Footer */}
        <div className="bg-parchment-100 px-8 py-6 text-center">
          <p className="text-xs text-espresso-600">
            {BUSINESS.name} &middot; Norfolk, VA
          </p>
        </div>
      </div>
    </div>
  );
}
