import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { isAuthed, SESSION_COOKIE } from "@/lib/auth";
import { CATEGORIES, BUSINESS } from "@/lib/constants";
import AnimatedSearchBar from "./AnimatedSearchBar";
import LikesNavLink from "./LikesNavLink";

export default async function Header() {
  const store = cookies();
  const authed = isAuthed(store);

  return (
    <header className="sticky top-9 z-50 border-b border-espresso-900/10 bg-parchment-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:gap-8 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo-mark.png"
            alt="Michael Millard-Lowe Antiques monogram"
            width={40}
            height={40}
            className="h-9 w-9 rounded-full ring-1 ring-espresso-900/10"
            priority
          />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-serif text-base font-semibold tracking-tight text-espresso-950">
              Michael Millard-Lowe
            </span>
            <span className="text-[11px] uppercase tracking-[0.14em] text-espresso-600">
              {BUSINESS.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 md:block">
          <AnimatedSearchBar />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          {/* Likes used to be hidden below the sm breakpoint, with no other
              way to reach it on mobile once the crowded bottom tab bar
              (which had a Likes tab) was removed - so it now shows here at
              every screen size instead. */}
          <LikesNavLink className="flex" />
          <Link
            href={authed ? "/admin" : "/admin/login"}
            className="rounded-full border border-espresso-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-espresso-950 transition-colors hover:bg-espresso-950 hover:text-parchment-50 sm:px-4"
          >
            {authed ? "Dashboard" : "Login"}
          </Link>
        </div>
      </div>

      <div className="block px-4 pb-3 md:hidden">
        <AnimatedSearchBar />
      </div>

      <nav className="border-t border-espresso-900/10">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2.5 text-sm font-medium text-espresso-800 sm:px-6 lg:px-8">
          <Link
            href="/category/new-arrivals"
            className="shrink-0 transition-colors hover:text-clay-600"
          >
            New Arrivals
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="shrink-0 transition-colors hover:text-clay-600"
            >
              {c.label}
            </Link>
          ))}
          <a
            href={BUSINESS.chairishUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 transition-colors hover:text-clay-600"
          >
            Shop on Chairish
          </a>
          <Link
            href="/category/all?sale=1"
            className="shrink-0 font-semibold text-clay-600 transition-colors hover:text-clay-500"
          >
            Sale
          </Link>
        </div>
      </nav>
    </header>
  );
}
