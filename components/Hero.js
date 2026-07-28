import Link from "next/link";
import Image from "next/image";
import { BUSINESS } from "@/lib/constants";

export default function Hero({ heroImage }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-parchment-100 via-parchment-50 to-espresso-100/60">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
        <div className="animate-fadeInUp">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">
            {BUSINESS.tagline} &middot; Norfolk, VA
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.1] text-espresso-950 sm:text-5xl">
            Timeless Pieces.
            <br />
            Live With History.
          </h1>
          <p className="mt-4 max-w-md text-base text-espresso-700">
            We source unique 18th, 19th &amp; 20th century furniture,
            lighting, art and objects almost exclusively in France and Italy
            &mdash; brought home to Norfolk for the friends of our shop.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/category/all"
              className="rounded-full bg-espresso-950 px-6 py-3 text-sm font-semibold text-parchment-50 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-cardHover"
            >
              Shop All Antiques
            </Link>
            <a
              href={`tel:${BUSINESS.phoneHref}`}
              className="rounded-full border border-espresso-900/20 px-6 py-3 text-sm font-semibold text-espresso-950 transition-colors hover:bg-espresso-950 hover:text-parchment-50"
            >
              Call {BUSINESS.phoneDisplay}
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="font-serif text-xl font-semibold text-espresso-950">
                Since 2016
              </dt>
              <dd className="text-espresso-600">On Chairish</dd>
            </div>
            <div>
              <dt className="font-serif text-xl font-semibold text-espresso-950">
                350+
              </dt>
              <dd className="text-espresso-600">Pieces Sold</dd>
            </div>
            <div>
              <dt className="font-serif text-xl font-semibold text-espresso-950">
                Licensed
              </dt>
              <dd className="text-espresso-600">Appraiser &amp; Auctioneer</dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl shadow-cardHover">
          {heroImage ? (
            <Image
              src={heroImage}
              alt="Featured antique"
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-espresso-200" />
          )}
        </div>
      </div>
    </section>
  );
}
