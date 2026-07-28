import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthed } from "@/lib/auth";
import { mergeScrapedListings, listAllForAdmin } from "@/lib/admin-listings";
import { scrapeShop } from "@/lib/chairish";
import { BUSINESS } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

// Vercel kills this function at maxDuration (60s). Fetching the 3 shop
// listing pages to discover URLs is cheap, but scraping each product's
// full detail page (plus a polite ~300ms delay between requests) is not -
// scraping all ~133 items in one click would blow well past 60s and get
// killed mid-write. So each click only detail-scrapes a safe-sized batch
// (prioritizing items not already in data/listings.json - see
// skipProductIds in lib/chairish.js), and clicking again picks up where
// the last click left off. A full, unlimited sync with no timeout is
// always available locally via `npm run sync:chairish`.
const PER_CLICK_ITEM_BUDGET = 45;

export async function POST() {
  if (!isAuthed(cookies())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const current = await listAllForAdmin();
    const existingIds = new Set(
      current.filter((l) => l.sourceProductId).map((l) => l.sourceProductId)
    );

    const { results, errors } = await scrapeShop(BUSINESS.chairishUrl, {
      maxPages: 10,
      maxItems: PER_CLICK_ITEM_BUDGET,
      skipProductIds: existingIds,
    });

    if (results.length === 0) {
      return NextResponse.json(
        {
          error:
            "Couldn't read any listings from Chairish right now. This can happen if Chairish is blocking automated requests from Vercel, or if every item on Chairish is already imported. Try running `npm run sync:chairish` from your own computer instead.",
          details: errors.slice(0, 5),
        },
        { status: 502 }
      );
    }

    const summary = await mergeScrapedListings(results);
    return NextResponse.json({
      ...summary,
      note:
        summary.added + summary.updated >= PER_CLICK_ITEM_BUDGET
          ? "Hit this click's batch limit - click Sync again to pick up any remaining items."
          : undefined,
      errors: errors.slice(0, 5),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err.message ||
          "Chairish sync failed. Try running `npm run sync:chairish` locally instead.",
      },
      { status: 500 }
    );
  }
}
