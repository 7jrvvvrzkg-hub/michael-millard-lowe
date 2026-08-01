import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Forwards a subscriber's email to a Google Apps Script "Web app" that
// appends it to a Google Sheet - see the README's "Newsletter signups"
// section for the full walkthrough of setting that sheet + script up.
// This route exists (rather than having the browser POST straight to
// Google) mainly to avoid CORS issues calling script.google.com directly
// from client-side JS, and to keep the actual Sheet URL out of the
// client-visible bundle.
export async function POST(request) {
  const { email } = await request.json().catch(() => ({}));
  const trimmed = (email || "").trim();

  if (!isValidEmail(trimmed)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    return NextResponse.json(
      {
        error:
          "Newsletter signups aren't connected yet - see the README's \"Newsletter signups\" section to set up the Google Sheet.",
      },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email: trimmed }).toString(),
      // Apps Script web apps issue a redirect before serving their real
      // response - fetch follows redirects by default, but being explicit
      // here since this exact behavior has tripped people up before.
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not save your email. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not save your email. Please try again." },
      { status: 500 }
    );
  }
}
