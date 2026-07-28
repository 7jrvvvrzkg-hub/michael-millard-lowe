import { NextResponse } from "next/server";
import {
  verifyPassword,
  createSessionToken,
  isAdminConfigured,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (!isAdminConfigured()) {
    // This is almost always the real cause when a password "doesn't work"
    // on a freshly deployed site: ADMIN_PASSWORD_HASH / SESSION_SECRET were
    // set in .env.local for local dev, but never added as Environment
    // Variables in the Vercel project, so this deployment has no password
    // configured at all - no password would work here, not just the right
    // one.
    return NextResponse.json(
      {
        error:
          "Admin login isn't configured on this deployment - ADMIN_PASSWORD_HASH and/or SESSION_SECRET aren't set. Add them in Vercel under Project Settings → Environment Variables (copy the values from .env.example), then redeploy.",
      },
      { status: 500 }
    );
  }

  if (!verifyPassword(password)) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  const token = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
