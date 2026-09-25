import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getListingById } from "@/lib/listings";

export const runtime = "nodejs";

// Square's connect.squareup.com (production) vs connect.squareupsandbox.com
// (sandbox/test) - same idea as Stripe's sk_test_/sk_live_ key prefixes,
// except Square splits it by base URL instead of by key format. Defaults to
// sandbox so a missing/unset SQUARE_ENVIRONMENT can never accidentally take
// a real payment - you have to opt in to "production" on purpose once
// you're ready to go live.
function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

// Square API responses are versioned by calendar date - see
// https://developer.squareup.com/docs/build-basics/versioning-overview.
// Bump this occasionally; an old-but-valid date still works, it just won't
// have newer fields/behavior.
const SQUARE_API_VERSION = "2026-09-16";

// Creates a Square Payment Link for a single listing and hands the client
// the hosted checkout URL to redirect to - same shape of response
// ({ url }) the old Stripe version returned, so components/BuyButton.js
// needed zero changes for this swap.
//
// Runs against whichever base URL SQUARE_ENVIRONMENT points at. Sandbox
// takes Square's fake test cards and moves no real money - exactly what
// you want while trying the flow out. Only set SQUARE_ENVIRONMENT=production
// once a real Square location is connected and you're ready to accept real
// payments.
export async function POST(request) {
  if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
    return NextResponse.json(
      {
        error:
          "Buy Now isn't set up yet - add SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID to your environment variables (a sandbox access token and location ID from the Square Developer Dashboard work with no real bank account needed).",
      },
      { status: 500 }
    );
  }

  const { listingId } = await request.json().catch(() => ({}));
  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  const listing = getListingById(listingId);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.status === "sold") {
    return NextResponse.json(
      { error: "This item has already sold." },
      { status: 409 }
    );
  }
  if (!listing.price || listing.price <= 0) {
    return NextResponse.json(
      {
        error:
          "This item doesn't have a set price yet - please email or call to inquire.",
      },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Square's `reference_id` on an Order is capped at 40 characters, and
  // this project's listing IDs (slugs like
  // "henri-ii-style-bronze-sconces-diane-de-poitiers-pair") can easily run
  // longer than that - so reference_id alone can't be trusted to hold the
  // full ID. metadata is the reliable one (255-char values), but Square's
  // own webhook payload doesn't consistently include either field in
  // practice (a known, still-open gap - see the webhook route's comments),
  // so the webhook re-fetches the order by ID and reads metadata from
  // there rather than trusting what arrives in the webhook body itself.
  const body = {
    idempotency_key: crypto.randomUUID(),
    order: {
      location_id: process.env.SQUARE_LOCATION_ID,
      line_items: [
        {
          name: listing.title,
          quantity: "1",
          base_price_money: {
            amount: Math.round(listing.price * 100),
            currency: "USD",
          },
        },
      ],
      reference_id: listing.id.slice(0, 40),
      metadata: { listingId: listing.id },
    },
    checkout_options: {
      redirect_url: `${siteUrl}/checkout/success`,
    },
  };

  try {
    const res = await fetch(`${squareBaseUrl()}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Square-Version": SQUARE_API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        data?.errors?.map((e) => e.detail).join("; ") || "Could not start checkout.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ url: data.payment_link.url });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Could not start checkout." },
      { status: 500 }
    );
  }
}
