import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthed } from "@/lib/auth";
import { updateOfferStatus } from "@/lib/admin-offers";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  if (!isAuthed(cookies())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  try {
    const offer = await updateOfferStatus(params.id, body);
    return NextResponse.json({ offer });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
