import { NextResponse } from "next/server";
import { getAllListings } from "@/lib/listings";

// Public, read-only. Used by the client-side Likes page to look up full
// listing details for whatever IDs are saved in the visitor's browser.
export async function GET() {
  return NextResponse.json({ listings: getAllListings() });
}
