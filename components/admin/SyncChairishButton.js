"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function SyncReport({ report, note }) {
  const rows = [
    {
      show: true,
      icon: report.blocked ? "!" : "✓",
      color: report.blocked ? "text-red-600" : "text-espresso-700",
      dot: report.blocked ? "bg-red-500" : "bg-espresso-500",
      label: report.blocked
        ? "Couldn't reach Chairish"
        : report.totalOnChairish != null
        ? `${report.checked} listing${report.checked === 1 ? "" : "s"} checked (of ${report.totalOnChairish} on Chairish)`
        : `${report.checked} listing${report.checked === 1 ? "" : "s"} checked`,
    },
    {
      show: !report.blocked && report.imported > 0,
      icon: "+",
      color: "text-purple-600",
      dot: "bg-purple-500",
      label: `${report.imported} new listing${report.imported === 1 ? "" : "s"} imported`,
    },
    {
      show: report.updated > 0,
      icon: "↻",
      color: "text-blue-600",
      dot: "bg-blue-500",
      label: `${report.updated} listing${report.updated === 1 ? "" : "s"} updated`,
    },
    {
      show: report.markedSold > 0,
      icon: "●",
      color: "text-green-600",
      dot: "bg-green-500",
      label: `${report.markedSold} listing${report.markedSold === 1 ? "" : "s"} marked sold`,
    },
    {
      show: true,
      icon: report.errorCount > 0 ? "!" : "✓",
      color: report.errorCount > 0 ? "text-red-600" : "text-espresso-400",
      dot: report.errorCount > 0 ? "bg-red-500" : "bg-espresso-300",
      label: `${report.errorCount} error${report.errorCount === 1 ? "" : "s"}`,
    },
  ];

  return (
    <div className="mt-3 max-w-sm rounded-xl border border-espresso-900/10 bg-white p-4 shadow-card">
      <ul className="space-y-1.5">
        {rows
          .filter((r) => r.show)
          .map((r) => (
            <li
              key={r.label}
              className={`flex items-center gap-2 text-sm font-medium ${r.color}`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white ${r.dot}`}
              >
                {r.icon}
              </span>
              {r.label}
            </li>
          ))}
      </ul>
      <p className="mt-3 border-t border-espresso-900/10 pt-2 text-xs text-espresso-500">
        Completed in {report.elapsedSeconds}s
      </p>
      {note && (
        <p className="mt-2 text-xs text-clay-600">{note}</p>
      )}
    </div>
  );
}

export default function SyncChairishButton() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setError("");
    setReport(null);
    setNote("");
    try {
      const res = await fetch("/api/admin/sync-chairish", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sync failed.");
      } else if (data.report) {
        setReport(data.report);
        setNote(data.note || "");
        router.refresh();
      } else {
        // Fallback in case the API ever responds without the report shape.
        setNote(
          `Synced: ${data.added} added, ${data.updated} updated, ${data.total} total listings.`
        );
        router.refresh();
      }
    } catch {
      setError("Sync failed. Try `npm run sync:chairish` locally instead.");
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
      {error && (
        <p className="mt-2 max-w-sm text-xs text-red-600">{error}</p>
      )}
      {report && <SyncReport report={report} note={note} />}
    </div>
  );
}
