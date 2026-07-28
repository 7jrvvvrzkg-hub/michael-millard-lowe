"use client";

import { useState } from "react";

export default function OfferForm({ listingId, listingTitle }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    message: "",
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't send that offer. Try again.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Couldn't send that offer. Try again.");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <p className="rounded-xl border border-green-600/20 bg-green-50 px-4 py-3 text-sm text-green-800">
        Offer sent on <strong>{listingTitle}</strong>. We&rsquo;ll be in touch
        by phone or email to follow up.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-espresso-900/20 px-6 py-3 text-sm font-semibold text-espresso-950 transition-colors hover:bg-espresso-950 hover:text-parchment-50"
      >
        Make an Offer
      </button>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-espresso-900/15 bg-white px-3.5 py-2.5 text-sm outline-none ring-clay-500 focus:ring-2";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-espresso-900/10 bg-parchment-100/50 p-4"
    >
      <p className="text-sm font-semibold text-espresso-900">
        Make an offer on {listingTitle}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Your name"
          className={inputClass}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <input
          type="number"
          min="1"
          required
          placeholder="Your offer (USD)"
          className={inputClass}
          value={form.amount}
          onChange={(e) => update("amount", e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className={inputClass}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <input
          type="tel"
          placeholder="Phone"
          className={inputClass}
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>
      <textarea
        rows={2}
        placeholder="Message (optional)"
        className={inputClass}
        value={form.message}
        onChange={(e) => update("message", e.target.value)}
      />
      <p className="text-xs text-espresso-500">
        Add an email or phone number so we can respond.
      </p>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-espresso-950 px-5 py-2.5 text-sm font-semibold text-parchment-50 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Offer"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-espresso-900/20 px-5 py-2.5 text-sm font-semibold text-espresso-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
