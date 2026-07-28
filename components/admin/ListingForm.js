"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

const empty = {
  title: "",
  price: "",
  compareAtPrice: "",
  category: "",
  condition: "Antique, Good Condition",
  era: "",
  origin: "",
  dimW: "",
  dimD: "",
  dimH: "",
  description: "",
  tags: "",
  images: "",
  featured: false,
  status: "available",
};

function listingToFormState(listing) {
  if (!listing) return empty;
  return {
    title: listing.title || "",
    price: listing.price ?? "",
    compareAtPrice: listing.compareAtPrice ?? "",
    category: listing.category || "",
    condition: listing.condition || "",
    era: listing.era || "",
    origin: listing.origin || "",
    dimW: listing.dimensions?.w ?? "",
    dimD: listing.dimensions?.d ?? "",
    dimH: listing.dimensions?.h ?? "",
    description: listing.description || "",
    tags: (listing.tags || []).join(", "),
    images: (listing.images || []).join("\n"),
    featured: Boolean(listing.featured),
    status: listing.status || "available",
  };
}

export default function ListingForm({ listing }) {
  const isEdit = Boolean(listing);
  const [form, setForm] = useState(() => listingToFormState(listing));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title: form.title,
      price: form.price,
      compareAtPrice: form.compareAtPrice || null,
      category: form.category || null,
      condition: form.condition,
      era: form.era,
      origin: form.origin,
      dimensions: { w: form.dimW, d: form.dimD, h: form.dimH, unit: "in" },
      description: form.description,
      tags: form.tags,
      images: form.images,
      featured: form.featured,
      status: form.status,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/listings/${listing.id}` : "/api/admin/listings",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
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

  const inputClass =
    "w-full rounded-lg border border-espresso-900/15 bg-white px-3.5 py-2.5 text-sm outline-none ring-clay-500 focus:ring-2";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-espresso-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Title *</label>
          <input
            required
            className={inputClass}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder='Louis XV Style Chair'
          />
        </div>

        <div>
          <label className={labelClass}>Price (USD) *</label>
          <input
            required
            type="number"
            min="0"
            className={inputClass}
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Compare-at Price (optional)</label>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.compareAtPrice}
            onChange={(e) => update("compareAtPrice", e.target.value)}
            placeholder="Shows as a strikethrough sale price"
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">Auto-detect from title/description</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Condition</label>
          <input
            className={inputClass}
            value={form.condition}
            onChange={(e) => update("condition", e.target.value)}
            placeholder="Antique, Good Condition"
          />
        </div>

        <div>
          <label className={labelClass}>Era / Period</label>
          <input
            className={inputClass}
            value={form.era}
            onChange={(e) => update("era", e.target.value)}
            placeholder="e.g. 18th Century, Louis XVI"
          />
        </div>

        <div>
          <label className={labelClass}>Origin</label>
          <input
            className={inputClass}
            value={form.origin}
            onChange={(e) => update("origin", e.target.value)}
            placeholder="e.g. France"
          />
        </div>

        <div className="sm:col-span-2 grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Width (in)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={form.dimW}
              onChange={(e) => update("dimW", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Depth (in)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={form.dimD}
              onChange={(e) => update("dimD", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Height (in)</label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={form.dimH}
              onChange={(e) => update("dimH", e.target.value)}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            rows={4}
            className={inputClass}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Tags (comma separated)</label>
          <input
            className={inputClass}
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            placeholder="chair, velvet, louis xv style"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>
            Image URLs (one per line - first is the cover photo)
          </label>
          <textarea
            rows={4}
            className={`${inputClass} font-mono text-xs`}
            value={form.images}
            onChange={(e) => update("images", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-espresso-800 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
            className="h-4 w-4 rounded border-espresso-900/30 text-clay-600"
          />
          Feature this item on the homepage
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-espresso-950 px-6 py-3 text-sm font-semibold text-parchment-50 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-cardHover disabled:opacity-60"
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Listing"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-full border border-espresso-900/20 px-6 py-3 text-sm font-semibold text-espresso-800 hover:bg-espresso-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
