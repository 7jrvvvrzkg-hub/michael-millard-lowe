import Link from "next/link";
import { CATEGORIES, BUSINESS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-espresso-900/10 bg-espresso-950 text-parchment-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <p className="font-serif text-lg font-semibold text-parchment-50">
            {BUSINESS.name}
          </p>
          <p className="mt-2 text-sm text-parchment-100/70">
            {BUSINESS.tagline}
          </p>
          <p className="mt-4 text-sm text-parchment-100/70">
            {BUSINESS.addressLine1}
            <br />
            {BUSINESS.addressLine2}
          </p>
          <a
            href={`tel:${BUSINESS.phoneHref}`}
            className="mt-3 inline-block text-sm font-semibold text-clay-400 hover:text-clay-500"
          >
            {BUSINESS.phoneDisplay}
          </a>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-parchment-100/50">
            Shop
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-parchment-100/80">
            <li>
              <Link href="/category/new-arrivals" className="hover:text-clay-400">
                New Arrivals
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-clay-400">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-parchment-100/50">
            Visit Us
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-parchment-100/80">
            <li>By appointment &amp; in-store</li>
            <li>Licensed appraiser &amp; auctioneer</li>
            <li>
              <a
                href={BUSINESS.chairishUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-clay-400"
              >
                Our Chairish Storefront
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-parchment-100/50">
            Get In Touch
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-parchment-100/80">
            <li>
              <a href={`tel:${BUSINESS.phoneHref}`} className="hover:text-clay-400">
                {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-clay-400">
                {BUSINESS.email}
              </a>
            </li>
            <li>
              <a
                href={BUSINESS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-clay-400"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-parchment-100/10 py-5 text-center text-xs text-parchment-100/40">
        &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
      </div>
    </footer>
  );
}
