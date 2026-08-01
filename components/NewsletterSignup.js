"use client";

import { useState } from "react";

// Sits at the bottom of every page (see app/layout.js) so a visitor can
// subscribe no matter where they land. The actual storage is a Google
// Sheet - see /api/newsletter/route.js and the README's "Newsletter
// signups" section for how emails get from this form into that sheet.
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("You're on the list - watch for our next catalogue.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <section className="border-t border-espresso-900/10 bg-parchment-100/60">
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay-600">
          Stay in the Loop
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-espresso-950 sm:text-3xl">
          Get the monthly catalogue
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-espresso-700">
          New arrivals and curated finds, straight to your inbox once a
          month - nothing more.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 flex max-w-sm flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-full border border-espresso-900/15 bg-white px-4 py-2.5 text-sm outline-none ring-clay-500 focus:ring-2"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 rounded-full bg-espresso-950 px-6 py-2.5 text-sm font-semibold text-parchment-50 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-cardHover disabled:opacity-60"
          >
            {status === "loading" ? "Joining..." : "Subscribe"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-3 text-xs ${
              status === "error" ? "text-red-600" : "text-green-700"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
