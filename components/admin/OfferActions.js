"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OfferActions({ offer }) {
  const [loading, setLoading] = useState(false);
  const [countering, setCountering] = useState(false);
  const [counterAmount, setCounterAmount] = useState(offer.counterAmount || "");
  const router = useRouter();

  async function setStatus(status, extra = {}) {
    setLoading(true);
    const res = await fetch(`/api/admin/offers/${offer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    setLoading(false);
    if (res.ok) {
      setCountering(false);
      router.refresh();
    } else {
      alert("Couldn't update that offer. Try again.");
    }
  }

  if (countering) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          autoFocus
          value={counterAmount}
          onChange={(e) => setCounterAmount(e.target.value)}
          placeholder="Counter $"
          className="w-24 rounded-lg border border-espresso-900/15 px-2 py-1 text-xs outline-none ring-clay-500 focus:ring-2"
        />
        <button
          onClick={() => setStatus("countered", { counterAmount })}
          disabled={loading || !counterAmount}
          className="text-xs font-semibold text-clay-600 hover:text-clay-500 disabled:opacity-50"
        >
          Send
        </button>
        <button
          onClick={() => setCountering(false)}
          className="text-xs text-espresso-500 hover:text-espresso-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => setStatus("accepted")}
        disabled={loading}
        className="text-xs font-semibold text-green-700 hover:text-green-800 disabled:opacity-50"
      >
        Accept
      </button>
      <button
        onClick={() => setCountering(true)}
        disabled={loading}
        className="text-xs font-semibold text-clay-600 hover:text-clay-500 disabled:opacity-50"
      >
        Counter
      </button>
      <button
        onClick={() => setStatus("declined")}
        disabled={loading}
        className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        Decline
      </button>
    </div>
  );
}
