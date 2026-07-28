"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <Image
        src="/logo-mark.png"
        alt="Michael Millard-Lowe Antiques"
        width={64}
        height={64}
        className="mb-5 rounded-full ring-1 ring-espresso-900/10"
      />
      <h1 className="font-serif text-2xl font-semibold text-espresso-950">
        Owner Login
      </h1>
      <p className="mt-1 text-sm text-espresso-600">
        Sign in to add and manage listings.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 w-full space-y-4 rounded-2xl border border-espresso-900/10 bg-parchment-50 p-6 shadow-card"
      >
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-espresso-600"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-espresso-900/15 bg-white px-3.5 py-2.5 text-sm outline-none ring-clay-500 focus:ring-2"
            placeholder="••••••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-espresso-950 px-4 py-3 text-sm font-semibold text-parchment-50 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-cardHover disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
