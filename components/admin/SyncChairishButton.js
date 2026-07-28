"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncChairishButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/sync-chairish", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Sync failed.");
      } else {
        setMessage(
          `Synced: ${data.added} added, ${data.updated} updated, ${data.total} total listings.`
        );
        router.refresh();
      }
    } catch {
      setMessage("Sync failed. Try `npm run sync:chairish` locally instead.");
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={loading}
        className="rounded-full border border-espresso-900/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-espresso-800 transition-colors hover:bg-espresso-950 hover:text-parchment-50 disabled:opacity-50"
      >
        {loading ? "Syncing from Chairish..." : "Sync from Chairish"}
      </button>
      {message && (
        <p className="mt-2 max-w-sm text-xs text-espresso-600">{message}</p>
      )}
    </div>
  );
}
