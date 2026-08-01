import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { listAllForAdmin } from "@/lib/admin-listings";
import { listAllOffers } from "@/lib/admin-offers";
import LogoutButton from "@/components/admin/LogoutButton";
import SyncChairishButton from "@/components/admin/SyncChairishButton";
import ListingsExplorer from "@/components/admin/ListingsExplorer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  if (!isAuthed(cookies())) redirect("/admin/login");

  const listings = await listAllForAdmin();
  const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

  // Sold items get their own group up top, separate from everything still
  // for sale - makes it obvious at a glance what's moved without having to
  // scan a single long list for the word "sold".
  const soldListings = listings.filter((l) => l.status === "sold").sort(byNewest);
  const activeListings = listings
    .filter((l) => l.status !== "sold")
    .sort(byNewest);

  const offers = await listAllOffers();
  const pendingOffers = offers.filter((o) => o.status === "pending").length;

  const usingGithub = Boolean(
    process.env.GITHUB_TOKEN && process.env.GITHUB_REPO
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-espresso-950">
            Owner Dashboard
          </h1>
          <p className="mt-1 text-sm text-espresso-600">
            {listings.length} listings &middot;{" "}
            {usingGithub
              ? "Saving to GitHub (live site updates on redeploy, ~60s)"
              : "Saving to local data/listings.json"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/newsletter"
            className="rounded-full border border-espresso-900/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-espresso-800 transition-colors hover:bg-espresso-950 hover:text-parchment-50"
          >
            Preview Newsletter
          </Link>
          <Link
            href="/admin/analytics"
            className="rounded-full border border-espresso-900/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-espresso-800 transition-colors hover:bg-espresso-950 hover:text-parchment-50"
          >
            Analytics
          </Link>
          <Link
            href="/admin/offers"
            className="relative rounded-full border border-espresso-900/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-espresso-800 transition-colors hover:bg-espresso-950 hover:text-parchment-50"
          >
            Offers
            {pendingOffers > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-clay-600 px-1 text-[10px] font-semibold text-parchment-50">
                {pendingOffers}
              </span>
            )}
          </Link>
          <SyncChairishButton />
          <Link
            href="/admin/new"
            className="rounded-full bg-espresso-950 px-5 py-2.5 text-sm font-semibold text-parchment-50 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-cardHover"
          >
            + Add Listing
          </Link>
          <LogoutButton />
        </div>
      </div>

      {!usingGithub && (
        <p className="mt-6 rounded-xl border border-clay-500/30 bg-clay-400/10 px-4 py-3 text-sm text-espresso-800">
          Heads up: <strong>GITHUB_TOKEN</strong> / <strong>GITHUB_REPO</strong>{" "}
          aren&rsquo;t set, so changes here are only saved to this local
          server. Set them (see .env.example) so listings you add on the live
          Vercel site get committed back to GitHub.
        </p>
      )}

      <ListingsExplorer soldListings={soldListings} activeListings={activeListings} />
    </div>
  );
}
