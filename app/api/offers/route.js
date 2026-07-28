import { NextResponse } from "next/server";
import { createOffer } from "@/lib/admin-offers";
import { getListingById } from "@/lib/listings";

export const runtime = "nodejs";

// Public - anyone can submit an offer on a listing, the same way anyone
// could fill out a "contact the seller" form. No money moves here; this
// just records the offer for the owner to review in /admin/offers and
// follow up by phone or email.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const listing = getListingById(body.listingId);
  if (!listing) {
    return NextResponse.json({ error: "That listing no longer exists." }, { status: 404 });
  }

  try {
    const offer = await createOffer({
      ...body,
      listingTitle: listing.title,
    });
    return NextResponse.json({ offer }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
