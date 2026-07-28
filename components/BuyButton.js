"use client";

import { useState } from "react";

export default function BuyButton({ listingId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-espresso-950 px-6 py-3 text-sm font-semibold text-parchment-50 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-cardHover disabled:opacity-60"
      >
        {loading ? "Starting checkout..." : "Buy Now"}
      </button>
      {error && <p className="mt-2 max-w-xs text-sm text-red-700">{error}</p>}
    </div>
  );
}
