import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthed } from "@/lib/auth";
import { getAnalytics } from "@/lib/analytics";
import { getListingById, formatPrice } from "@/lib/listings";
import { CATEGORY_MAP } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

function toSortedEntries(map, limit) {
  return Object.entries(map || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

// A simple horizontal bar row - deliberately plain CSS divs rather than a
// charting library, since this is the only place in the project that would
// need one and a handful of bars don't justify the extra dependency.
function BarRow({ label, count, max, accent = "bg-clay-500" }) {
  const width = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="truncate pr-3 text-espresso-800">{label}</span>
        <span className="shrink-0 font-semibold text-espresso-950">{count}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-espresso-100">
        <div className={`h-full rounded-full ${accent}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-espresso-900/10 bg-white p-6 shadow-card">
      <h2 className="font-serif text-lg font-semibold text-espresso-950">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-espresso-500">{subtitle}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

export default async function AnalyticsPage() {
  if (!isAuthed(cookies())) redirect("/admin/login");

  const data = await getAnalytics();

  // Most viewed pieces - join view counts back to the actual listing so we
  // can show a real title/price instead of a bare ID. Listings that were
  // since deleted are skipped rather than shown as blank rows.
  const viewedEntries = toSortedEntries(data.views, 8)
    .map(([listingId, count]) => ({ listing: getListingById(listingId), count }))
    .filter((row) => row.listing);
  const maxViews = viewedEntries[0]?.count || 0;

  // Popular searches - straight from the raw counts.
  const searchEntries = toSortedEntries(data.searches, 8);
  const maxSearches = searchEntries[0]?.[1] || 0;

  // Popular categories - tracked directly whenever a listing page is
  // viewed (see lib/analytics.js's recordView).
  const categoryEntries = toSortedEntries(data.categoryViews, 8);
  const maxCategoryViews = categoryEntries[0]?.[1] || 0;

  // Popular eras - not tracked as its own counter; derived here by summing
  // each listing's view count into whatever era that listing belongs to.
  const eraCounts = {};
  for (const [listingId, count] of Object.entries(data.views || {})) {
    const listing = getListingById(listingId);
    const era = listing?.era?.trim();
    if (!era) continue;
    eraCounts[era] = (eraCounts[era] || 0) + count;
  }
  const eraEntries = toSortedEntries(eraCounts, 8);
  const maxEraViews = eraEntries[0]?.[1] || 0;

  // Conversions - every completed Stripe checkout (see the
  // "checkout.session.completed" handler in app/api/stripe-webhook).
  const conversions = data.conversions || [];
  const totalRevenue = conversions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const recentConversions = [...conversions]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8)
    .map((c) => ({ ...c, listing: getListingById(c.listingId) }));

  const hasAnyData =
    viewedEntries.length > 0 ||
    searchEntries.length > 0 ||
    conversions.length > 0 ||
    categoryEntries.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-espresso-950">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-espresso-600">
            What visitors are looking at, searching for, and buying.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-espresso-900/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-espresso-800 transition-colors hover:bg-espresso-950 hover:text-parchment-50"
        >
          Back to Dashboard
        </Link>
      </div>

      {!hasAnyData && (
        <p className="mt-8 rounded-xl bg-espresso-100/50 px-6 py-12 text-center text-sm text-espresso-600">
          No activity tracked yet - numbers show up here as visitors view
          listings, search, and buy.
        </p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel title="Most Viewed Pieces" subtitle="By listing page views">
          {viewedEntries.length === 0 && (
            <p className="text-sm text-espresso-500">Nothing viewed yet.</p>
          )}
          {viewedEntries.map(({ listing, count }) => (
            <BarRow
              key={listing.id}
              label={`${listing.title} · ${formatPrice(listing.price)}`}
              count={count}
              max={maxViews}
              accent="bg-clay-500"
            />
          ))}
        </Panel>

        <Panel title="Popular Searches" subtitle="What visitors type into search">
          {searchEntries.length === 0 && (
            <p className="text-sm text-espresso-500">No searches yet.</p>
          )}
          {searchEntries.map(([term, count]) => (
            <BarRow key={term} label={term} count={count} max={maxSearches} accent="bg-blue-500" />
          ))}
        </Panel>

        <Panel title="Popular Categories" subtitle="Views by item category">
          {categoryEntries.length === 0 && (
            <p className="text-sm text-espresso-500">No category data yet.</p>
          )}
          {categoryEntries.map(([category, count]) => (
            <BarRow
              key={category}
              label={CATEGORY_MAP[category]?.label || category}
              count={count}
              max={maxCategoryViews}
              accent="bg-purple-500"
            />
          ))}
        </Panel>

        <Panel title="Popular Eras" subtitle="Views by era, from each viewed listing">
          {eraEntries.length === 0 && (
            <p className="text-sm text-espresso-500">No era data yet.</p>
          )}
          {eraEntries.map(([era, count]) => (
            <BarRow key={era} label={era} count={count} max={maxEraViews} accent="bg-green-600" />
          ))}
        </Panel>
      </div>

      <div className="mt-6">
        <Panel
          title="Conversions"
          subtitle={`${conversions.length} completed purchase${conversions.length === 1 ? "" : "s"} · ${formatPrice(totalRevenue)} total`}
        >
          {recentConversions.length === 0 && (
            <p className="text-sm text-espresso-500">No purchases yet.</p>
          )}
          {recentConversions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-espresso-500">
                  <tr>
                    <th className="pb-2 pr-4">Item</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso-900/5">
                  {recentConversions.map((c, i) => (
                    <tr key={`${c.listingId}-${c.at}-${i}`}>
                      <td className="py-2 pr-4 text-espresso-900">
                        {c.listing ? c.listing.title : c.listingId}
                      </td>
                      <td className="py-2 pr-4 text-espresso-900">
                        {c.amount != null ? formatPrice(c.amount) : "—"}
                      </td>
                      <td className="py-2 text-espresso-500">
                        {new Date(c.at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
