import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { listAllOffers } from "@/lib/admin-offers";
import { formatPrice } from "@/lib/listings";
import OfferActions from "@/components/admin/OfferActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Offers" };

const STATUS_STYLES = {
  pending: "bg-clay-400/20 text-clay-600",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-espresso-100 text-espresso-500",
  countered: "bg-espresso-900 text-parchment-50",
};

export default async function AdminOffersPage() {
  if (!isAuthed(cookies())) redirect("/admin/login");

  const offers = await listAllOffers();
  const sorted = [...offers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const pendingCount = offers.filter((o) => o.status === "pending").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-espresso-950">
            Offers
          </h1>
          <p className="mt-1 text-sm text-espresso-600">
            {offers.length} total &middot; {pendingCount} awaiting a reply
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-espresso-900/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-espresso-800 hover:bg-espresso-950 hover:text-parchment-50"
        >
          &larr; Dashboard
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-espresso-900/10 bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-espresso-100/60 text-xs uppercase tracking-wide text-espresso-600">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso-900/5">
            {sorted.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/listing/${o.listingId}`}
                    className="font-medium text-espresso-900 hover:text-clay-600"
                  >
                    {o.listingTitle || o.listingId}
                  </Link>
                </td>
                <td className="px-4 py-3 text-espresso-700">
                  <div>{o.name}</div>
                  <div className="text-xs text-espresso-500">
                    {o.email || o.phone}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-espresso-900">
                  {formatPrice(o.amount)}
                  {o.status === "countered" && o.counterAmount && (
                    <div className="text-xs font-normal text-clay-600">
                      countered {formatPrice(o.counterAmount)}
                    </div>
                  )}
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-espresso-600">
                  {o.message || "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[o.status] || STATUS_STYLES.pending
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <OfferActions offer={o} />
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-espresso-500">
                  No offers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
