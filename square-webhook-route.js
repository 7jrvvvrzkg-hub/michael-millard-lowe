import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { updateListing } from "@/lib/admin-listings";
import { recordConversion } from "@/lib/analytics";

export const runtime = "nodejs";

function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

const SQUARE_API_VERSION = "2026-09-16";

// The other half of Buy Now: once Square confirms a payment actually went
// through, it POSTs the event here so the listing gets flipped to "sold" on
// the site automatically - the same way a Chairish sale gets picked up by
// the Chairish sync (see lib/admin-listings.js's mergeScrapedListings), and
// the same role app/api/stripe-webhook/route.js used to play before the
// switch to Square.
//
// Setup (once you're ready to actually test a purchase, even in Square's
// sandbox): in the Square Developer Dashboard, open your application ->
// Webhooks, add a subscription pointed at
// https://yoursite.com/api/square-webhook, subscribe to the
// "payment.updated" event, then copy the "Signature Key" it gives you into
// SQUARE_WEBHOOK_SIGNATURE_KEY. That same exact URL (protocol, host, path,
// no trailing slash) has to be used below when verifying the signature -
// Square signs "the notification URL you configured" + the raw request
// body, so a mismatch there (e.g. http vs https, or a stray trailing
// slash) makes every signature check fail even though nothing is actually
// wrong with the payment.
export async function POST(request) {
  if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
    return NextResponse.json(
      { error: "Square webhook isn't configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-square-hmacsha256-signature");
  const rawBody = await request.text();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const notificationUrl = `${siteUrl}/api/square-webhook`;

  const expected = crypto
    .createHmac("sha256", process.env.SQUARE_WEBHOOK_SIGNATURE_KEY)
    .update(notificationUrl + rawBody, "utf8")
    .digest("base64");

  let signatureValid = false;
  try {
    const expectedBuf = Buffer.from(expected, "base64");
    const givenBuf = Buffer.from(signature || "", "base64");
    signatureValid =
      expectedBuf.length === givenBuf.length &&
      crypto.timingSafeEqual(expectedBuf, givenBuf);
  } catch {
    signatureValid = false;
  }

  if (!signatureValid) {
    // Almost always means either SQUARE_WEBHOOK_SIGNATURE_KEY doesn't
    // match what's shown in the Square Dashboard for this subscription, or
    // NEXT_PUBLIC_SITE_URL doesn't exactly match the notification URL
    // configured there - not a sign of a forged/malicious request most of
    // the time, but reject it either way since an unverified body can't be
    // trusted to act on.
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  const event = JSON.parse(rawBody);

  if (event.type === "payment.updated") {
    const payment = event.data?.object?.payment;
    if (payment?.status === "COMPLETED" && payment.order_id) {
      try {
        // The webhook payload itself doesn't reliably carry the
        // order/listing metadata set at checkout time (a known, still-open
        // gap in Square's webhook delivery as of writing) - so re-fetch the
        // order by ID here rather than trusting metadata/reference_id if
        // they happened to show up in the event body.
        const orderRes = await fetch(
          `${squareBaseUrl()}/v2/orders/${payment.order_id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
              "Square-Version": SQUARE_API_VERSION,
            },
          }
        );
        const orderData = await orderRes.json().catch(() => ({}));
        const listingId = orderData?.order?.metadata?.listingId;

        if (listingId) {
          try {
            await updateListing(listingId, { status: "sold" });
          } catch (err) {
            // Listing may have already been deleted/renamed since checkout
            // started - log and still return 200 so Square doesn't retry
            // this forever; a real payment already happened either way.
            console.error(
              `Could not mark listing "${listingId}" sold after payment:`,
              err.message
            );
          }
          // total_money.amount is in cents; record the real dollar amount
          // for the Analytics page's conversion tracking.
          const amount =
            typeof payment.total_money?.amount === "number"
              ? payment.total_money.amount / 100
              : null;
          await recordConversion(listingId, amount);
        }
      } catch (err) {
        console.error("Could not process Square payment.updated event:", err.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
