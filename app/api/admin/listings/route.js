import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthed } from "@/lib/auth";
import { listAllForAdmin, createListing } from "@/lib/admin-listings";

export const runtime = "nodejs";

function guard() {
  return isAuthed(cookies());
}

export async function GET() {
  if (!guard()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const listings = await listAllForAdmin();
  return NextResponse.json({ listings });
}

export async function POST(request) {
  if (!guard()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || !body.title) {
    return NextResponse.json(
      { error: "A title is required." },
      { status: 400 }
    );
  }
  try {
    const listing = await createListing(body);
    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
