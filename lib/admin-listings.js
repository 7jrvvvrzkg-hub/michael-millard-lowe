// Write-side data layer used only by admin API routes (Node runtime).
//
// This site's "database" is data/listings.json, committed to your GitHub
// repo. That's what makes it possible to run this whole project as static
// files in a repo the way you asked:
//
//   - Locally (`npm run dev`), writes go straight to the file on disk.
//   - On Vercel, there is no writable disk, so writes are made through the
//     GitHub Contents API instead - the admin panel commits the updated
//     data/listings.json straight to your repo. Vercel's GitHub integration
//     then auto-redeploys (usually well under a minute) and the change goes
//     live. Set GITHUB_TOKEN + GITHUB_REPO (see .env.example) to enable this.

import fs from "node:fs/promises";
import path from "node:path";
import { categorizeListing } from "./categorize.js";

const DATA_PATH = path.join(process.cwd(), "data", "listings.json");
const GITHUB_API = "https://api.github.com";

function githubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

async function githubGetFile() {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/contents/data/listings.json?ref=${encodeURIComponent(
      branch
    )}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Could not read data/listings.json from GitHub (${res.status}): ${body}`
    );
  }
  const json = await res.json();
  const content = Buffer.from(json.content, "base64").toString("utf-8");
  return { sha: json.sha, listings: JSON.parse(content) };
}

async function githubPutFile(listings, sha, message) {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const content = Buffer.from(
    JSON.stringify(listings, null, 2) + "\n",
    "utf-8"
  ).toString("base64");

  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/contents/data/listings.json`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content,
        sha,
        branch,
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Could not commit data/listings.json to GitHub (${res.status}): ${body}`
    );
  }
}

async function readCurrent() {
  if (githubConfigured()) {
    const { listings } = await githubGetFile();
    return listings;
  }
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeAll(listings, message) {
  if (githubConfigured()) {
    const { sha } = await githubGetFile();
    await githubPutFile(listings, sha, message);
    return { mode: "github" };
  }
  await fs.writeFile(
    DATA_PATH,
    JSON.stringify(listings, null, 2) + "\n",
    "utf-8"
  );
  return { mode: "local" };
}

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueId(base, existing) {
  let id = base || `listing-${Date.now()}`;
  let n = 2;
  const taken = new Set(existing.map((l) => l.id));
  while (taken.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

export async function listAllForAdmin() {
  return readCurrent();
}

export async function createListing(input) {
  const current = await readCurrent();
  const baseId = slugify(input.title || "listing");
  const id = await uniqueId(baseId, current);

  const listing = {
    id,
    title: input.title?.trim() || "Untitled Item",
    price: Number(input.price) || 0,
    compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : null,
    condition: input.condition?.trim() || "Antique, Good Condition",
    dimensions: {
      w: Number(input.dimensions?.w) || null,
      d: Number(input.dimensions?.d) || null,
      h: Number(input.dimensions?.h) || null,
      unit: input.dimensions?.unit || "in",
    },
    description: input.description?.trim() || "",
    category: input.category || null,
    tags: Array.isArray(input.tags)
      ? input.tags
      : (input.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
    era: input.era?.trim() || "",
    origin: input.origin?.trim() || "",
    images: Array.isArray(input.images)
      ? input.images.filter(Boolean)
      : (input.images || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
    featured: Boolean(input.featured),
    status: input.status || "available",
    source: "manual",
    sourceUrl: input.sourceUrl || null,
    sourceProductId: null,
    createdAt: new Date().toISOString(),
  };

  listing.category = listing.category || categorizeListing(listing);

  const next = [listing, ...current];
  await writeAll(next, `Add listing: ${listing.title}`);
  return listing;
}

export async function updateListing(id, input) {
  const current = await readCurrent();
  const idx = current.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error("Listing not found");

  const existing = current[idx];
  const updated = {
    ...existing,
    title: input.title?.trim() ?? existing.title,
    price: input.price !== undefined ? Number(input.price) : existing.price,
    compareAtPrice:
      input.compareAtPrice !== undefined
        ? input.compareAtPrice
          ? Number(input.compareAtPrice)
          : null
        : existing.compareAtPrice,
    condition: input.condition?.trim() ?? existing.condition,
    dimensions: input.dimensions
      ? {
          w: Number(input.dimensions.w) || null,
          d: Number(input.dimensions.d) || null,
          h: Number(input.dimensions.h) || null,
          unit: input.dimensions.unit || "in",
        }
      : existing.dimensions,
    description: input.description?.trim() ?? existing.description,
    category: input.category ?? existing.category,
    tags: Array.isArray(input.tags)
      ? input.tags
      : typeof input.tags === "string"
      ? input.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : existing.tags,
    era: input.era?.trim() ?? existing.era,
    origin: input.origin?.trim() ?? existing.origin,
    images: Array.isArray(input.images)
      ? input.images.filter(Boolean)
      : typeof input.images === "string"
      ? input.images
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : existing.images,
    featured: input.featured !== undefined ? Boolean(input.featured) : existing.featured,
    status: input.status || existing.status,
  };

  current[idx] = updated;
  await writeAll(current, `Update listing: ${updated.title}`);
  return updated;
}

export async function deleteListing(id) {
  const current = await readCurrent();
  const target = current.find((l) => l.id === id);
  const next = current.filter((l) => l.id !== id);
  await writeAll(next, `Delete listing: ${target ? target.title : id}`);
}

// activeProductIds (optional): the full set of sourceProductIds currently
// listed on the Chairish shop page (see scrapeShop in lib/chairish.js).
// This is how "did this sell on Chairish?" actually gets answered: nothing
// on the scraped product page itself reliably says "sold" (Chairish just
// removes sold items from the shop page), so the signal is a
// previously-imported chairish item's ID quietly disappearing from that
// active set. Without this, a sold item just sits there marked
// "available" on this site forever, since nothing else would ever tell it
// otherwise.
export async function mergeScrapedListings(scraped, activeProductIds) {
  const current = await readCurrent();
  const existingBySource = new Map(
    current
      .filter((l) => l.sourceProductId)
      .map((l) => [l.sourceProductId, l])
  );

  const merged = [...current];
  let added = 0;
  let updated = 0;
  let markedSold = 0;

  for (const item of scraped) {
    const existing = existingBySource.get(item.sourceProductId);
    if (existing) {
      const idx = merged.findIndex((l) => l.id === existing.id);
      merged[idx] = { ...existing, ...item, id: existing.id };
      updated += 1;
    } else {
      const id = await uniqueId(slugify(item.title), merged);
      merged.unshift({ ...item, id, createdAt: new Date().toISOString() });
      added += 1;
    }
  }

  // Safety guard: activeProductIds is only trustworthy if the shop-page
  // discovery step actually worked. If Chairish blocked the request, rate
  // limited us, or every page fetch failed, collectShopProductUrls can come
  // back empty (or badly truncated) while still looking like a normal
  // "nothing's active" result - without this check, that failure would
  // read as "everything sold" and wrongly flip every real listing to
  // status: "sold" in one sync. So we only ever act on activeProductIds
  // when it's at least half the size of what we already believed was
  // active; otherwise we skip the sold-marking pass entirely and leave
  // existing statuses untouched (added/updated listings from `scraped`
  // still go through above, since those came from real successful fetches).
  const previouslyActiveChairishCount = current.filter(
    (l) => l.source === "chairish" && l.status !== "sold"
  ).length;
  const activeIdsLookTrustworthy =
    activeProductIds &&
    (previouslyActiveChairishCount === 0 ||
      activeProductIds.size >= previouslyActiveChairishCount * 0.5);

  if (activeIdsLookTrustworthy) {
    for (let i = 0; i < merged.length; i += 1) {
      const l = merged[i];
      if (
        l.source === "chairish" &&
        l.sourceProductId &&
        l.status !== "sold" &&
        !activeProductIds.has(l.sourceProductId)
      ) {
        merged[i] = { ...l, status: "sold" };
        markedSold += 1;
      }
    }
  }
  const soldCheckSkipped = Boolean(activeProductIds) && !activeIdsLookTrustworthy;

  await writeAll(
    merged,
    `Sync ${added} new / ${updated} updated / ${markedSold} marked sold from Chairish`
  );
  return { added, updated, markedSold, soldCheckSkipped, total: merged.length };
}
