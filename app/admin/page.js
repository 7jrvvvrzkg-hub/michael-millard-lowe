import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isAuthed } from "@/lib/auth";
import { listAllForAdmin } from "@/lib/admin-listings";
import { listAllOffers } from "@/lib/admin-offers";
import { formatPrice } from "@/lib/listings";
import { CATEGORY_MAP } from "@/lib/constants";
import LogoutButton from "@/components/admin/LogoutButton";
import DeleteListingButton from "@/components/admin/DeleteListingButton";
import SyncChairishButton from "@/components/admin/SyncChairishButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  if (!isAuthed(cookies())) redirect("/admin/login");

  const listings = await listAllForAdmin();
  const sorted = [...listings].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

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

      <div className="mt-8 overflow-x-auto rounded-2xl border border-espresso-900/10 bg-white shadow-card">
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
            {sorted.map((l) => (
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
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      l.status === "sold"
                        ? "bg-espresso-900 text-parchment-50"
                        : l.status === "hidden"
                        ? "bg-espresso-100 text-espresso-500"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {l.status}
                  </span>
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
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-espresso-500">
                  No listings yet. Add your first one, or sync from Chairish.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
