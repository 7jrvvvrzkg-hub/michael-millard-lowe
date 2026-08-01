// Lightweight, dependency-free analytics: view counts, search terms, and
// conversions, stored in data/analytics.json using the exact same
// GitHub-commit-or-local-file pattern as lib/admin-listings.js and
// lib/admin-offers.js (see those files for the full explanation of why
// that pattern exists in the first place - no separate database in this
// project, GitHub is it).
//
// One real difference from listings/offers, worth calling out: those only
// get written to on infrequent, deliberate owner/buyer actions (adding a
// listing, making an offer). Page views and searches happen constantly, and
// every write here is a full GitHub commit that Vercel's Git integration
// would normally redeploy the whole site for. Redeploying on every single
// visitor pageview would be both slow and a genuinely bad practice - so
// this project ships a vercel.json with an "ignoreCommand" that tells
// Vercel to skip the rebuild when the *only* thing that changed is
// data/analytics.json. See vercel.json for that half of the fix.
import fs from "node:fs/promises";
import path from "node:path";

const DATA_PATH = path.join(process.cwd(), "data", "analytics.json");
const GITHUB_API = "https://api.github.com";

function githubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

async function githubGetFile() {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/contents/data/analytics.json?ref=${encodeURIComponent(
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
      `Could not read data/analytics.json from GitHub (${res.status}): ${body}`
    );
  }
  const json = await res.json();
  const content = Buffer.from(json.content, "base64").toString("utf-8");
  return { sha: json.sha, data: JSON.parse(content) };
}

async function githubPutFile(data, sha, message) {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const content = Buffer.from(
    JSON.stringify(data, null, 2) + "\n",
    "utf-8"
  ).toString("base64");

  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/contents/data/analytics.json`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, content, sha, branch }),
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Could not commit data/analytics.json to GitHub (${res.status}): ${body}`
    );
  }
}

function emptyData() {
  return { views: {}, categoryViews: {}, searches: {}, conversions: [] };
}

async function readCurrent() {
  if (githubConfigured()) {
    const { data } = await githubGetFile();
    return { ...emptyData(), ...data };
  }
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return { ...emptyData(), ...JSON.parse(raw) };
  } catch {
    return emptyData();
  }
}

async function writeAll(data, message) {
  if (githubConfigured()) {
    const { sha } = await githubGetFile();
    await githubPutFile(data, sha, message);
    return;
  }
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function bump(map, key, by = 1) {
  if (!key) return map;
  return { ...map, [key]: (map[key] || 0) + by };
}

// Fire-and-await from a Server Component render (see app/listing/[id]/page.js)
// - awaited rather than "fire and forget" because a serverless function's
// execution can be frozen the instant the response is sent, which could
// silently drop an unawaited write before it actually reaches GitHub. The
// tradeoff is a little added latency per page view; swap in a real
// analytics tool (Vercel Analytics, Plausible, GA4) instead of this if that
// ever becomes noticeable at higher traffic.
export async function recordView(listingId, category) {
  try {
    const data = await readCurrent();
    data.views = bump(data.views, listingId);
    if (category) data.categoryViews = bump(data.categoryViews, category);
    await writeAll(data, `View: ${listingId}`);
  } catch {
    // Analytics are best-effort - never let a tracking failure break the
    // page a real visitor is trying to look at.
  }
}

export async function recordSearch(query) {
  const trimmed = (query || "").trim().toLowerCase();
  if (!trimmed) return;
  try {
    const data = await readCurrent();
    data.searches = bump(data.searches, trimmed);
    await writeAll(data, `Search: ${trimmed}`);
  } catch {
    // best-effort, see recordView
  }
}

export async function recordConversion(listingId, amount) {
  try {
    const data = await readCurrent();
    data.conversions = [
      ...data.conversions,
      { listingId, amount: amount || null, at: new Date().toISOString() },
    ];
    await writeAll(data, `Conversion: ${listingId}`);
  } catch {
    // best-effort, see recordView
  }
}

export async function getAnalytics() {
  return readCurrent();
}
