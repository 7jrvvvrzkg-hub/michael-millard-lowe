import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthed } from "@/lib/auth";
import { listAllOffers } from "@/lib/admin-offers";

export const runtime = "nodejs";

export async function GET() {
  if (!isAuthed(cookies())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const offers = await listAllOffers();
  return NextResponse.json({ offers });
}
