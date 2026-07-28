import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthed } from "@/lib/auth";
import { mergeScrapedListings } from "@/lib/admin-listings";
import { scrapeShop } from "@/lib/chairish";
import { BUSINESS } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  if (!isAuthed(cookies())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { results, errors } = await scrapeShop(BUSINESS.chairishUrl, {
      maxPages: 3,
      maxItems: 40,
    });

    if (results.length === 0) {
      return NextResponse.json(
        {
          error:
            "Couldn't read any listings from Chairish right now. This can happen if Chairish is blocking automated requests from Vercel. Try running `npm run sync:chairish` from your own computer instead.",
          details: errors.slice(0, 5),
        },
        { status: 502 }
      );
    }

    const summary = await mergeScrapedListings(results);
    return NextResponse.json({ ...summary, errors: errors.slice(0, 5) });
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
