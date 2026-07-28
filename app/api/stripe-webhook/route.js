import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateListing } from "@/lib/admin-listings";

export const runtime = "nodejs";

// The other half of Buy Now: once Stripe confirms a payment actually went
// through, it POSTs the event here so the listing gets flipped to "sold" on
// the site automatically - the same way a Chairish sale gets picked up by
// the Chairish sync (see lib/admin-listings.js's mergeScrapedListings).
// Without this, a purchased item would just sit there still marked
// "available" until someone updated it by hand.
//
// Setup (once you're ready to actually test a purchase, even in Stripe test
// mode): in your Stripe dashboard, go to Developers > Webhooks > Add
// endpoint, point it at https://yoursite.com/api/stripe-webhook, subscribe
// to the "checkout.session.completed" event, then copy the signing secret
// it gives you into STRIPE_WEBHOOK_SECRET. For local testing, the Stripe
// CLI's `stripe listen --forward-to localhost:3000/api/stripe-webhook`
// prints a temporary signing secret you can use instead.
export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook isn't configured." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // Signature mismatch usually means this request didn't really come from
    // Stripe (or the wrong signing secret is configured) - reject rather
    // than trusting the body.
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const listingId = session.metadata?.listingId;
    if (listingId) {
      try {
        await updateListing(listingId, { status: "sold" });
      } catch (err) {
        // Listing may have already been deleted/renamed since checkout
        // started - log and still return 200 so Stripe doesn't retry this
        // forever; a real payment already happened either way.
        console.error(
          `Could not mark listing "${listingId}" sold after payment:`,
          err.message
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
