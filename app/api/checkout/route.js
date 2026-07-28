import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getListingById } from "@/lib/listings";

export const runtime = "nodejs";

// Creates a Stripe Checkout Session for a single listing and hands the
// client the hosted checkout URL to redirect to. This runs in whatever
// mode your STRIPE_SECRET_KEY is - a test-mode key (starts with sk_test_)
// takes fake test cards and moves no real money, which is exactly what you
// want while you're just trying the flow out. Flip to a live key
// (sk_live_) only once you've connected a real bank account in your Stripe
// dashboard and are ready to accept real payments.
export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          "Buy Now isn't set up yet - add STRIPE_SECRET_KEY to your environment variables (a test-mode secret key from dashboard.stripe.com works with no bank account needed).",
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
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Stripe requires product_data.images to be full absolute http(s) URLs -
  // it'll reject the whole session if it gets a relative path instead.
  // Chairish-sourced images always are absolute, but the admin's "paste an
  // image URL" field has no such enforcement, so a manually-added listing
  // could have a relative path here. Rather than let one bad image URL
  // break checkout entirely, just leave the image off in that case.
  const coverImage = listing.images?.[0];
  const hasAbsoluteImage =
    typeof coverImage === "string" && /^https?:\/\//i.test(coverImage);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(listing.price * 100),
            product_data: {
              name: listing.title,
              images: hasAbsoluteImage ? [coverImage] : undefined,
            },
          },
        },
      ],
      // Read back by the webhook (see app/api/stripe-webhook/route.js) so a
      // completed payment can automatically mark this exact listing sold.
      metadata: { listingId: listing.id },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/listing/${listing.id}?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Could not start checkout." },
      { status: 500 }
    );
  }
}
