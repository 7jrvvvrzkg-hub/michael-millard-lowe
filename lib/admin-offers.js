// Data layer for buyer offers ("Make an Offer" on a listing). Same
// GitHub-commit-or-local-file pattern as lib/admin-listings.js - see that
// file for the full explanation of why.
//
// Unlike listings, submitting an offer does not require the admin session
// (any visitor can make an offer on a listing - it's the equivalent of a
// contact form). Reading/managing offers, on the other hand, is admin-only
// and is gated in the API route, not here.

import fs from "node:fs/promises";
import path from "node:path";
import { githubFetch } from "./github-request.js";

const DATA_PATH = path.join(process.cwd(), "data", "offers.json");
const GITHUB_API = "https://api.github.com";

function githubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

async function githubGetFile() {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const res = await githubFetch(
    `${GITHUB_API}/repos/${repo}/contents/data/offers.json?ref=${encodeURIComponent(
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
      `Could not read data/offers.json from GitHub (${res.status}): ${body}`
    );
  }
  const json = await res.json();
  const content = Buffer.from(json.content, "base64").toString("utf-8");
  return { sha: json.sha, offers: JSON.parse(content) };
}

async function githubPutFile(offers, sha, message) {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const content = Buffer.from(
    JSON.stringify(offers, null, 2) + "\n",
    "utf-8"
  ).toString("base64");

  const res = await githubFetch(`${GITHUB_API}/repos/${repo}/contents/data/offers.json`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, content, sha, branch }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Could not commit data/offers.json to GitHub (${res.status}): ${body}`
    );
  }
}

async function readCurrent() {
  if (githubConfigured()) {
    const { offers } = await githubGetFile();
    return offers;
  }
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeAll(offers, message) {
  if (githubConfigured()) {
    const { sha } = await githubGetFile();
    await githubPutFile(offers, sha, message);
    return { mode: "github" };
  }
  await fs.writeFile(DATA_PATH, JSON.stringify(offers, null, 2) + "\n", "utf-8");
  return { mode: "local" };
}

export async function listAllOffers() {
  return readCurrent();
}

export async function createOffer(input) {
  const current = await readCurrent();

  const offer = {
    id: `offer-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    listingId: input.listingId,
    listingTitle: input.listingTitle || "",
    name: (input.name || "").trim(),
    email: (input.email || "").trim(),
    phone: (input.phone || "").trim(),
    amount: Number(input.amount) || 0,
    message: (input.message || "").trim(),
    status: "pending", // pending | accepted | declined | countered
    counterAmount: null,
    counterNote: "",
    createdAt: new Date().toISOString(),
  };

  if (!offer.listingId || !offer.name || (!offer.email && !offer.phone)) {
    throw new Error("An offer needs a name, an email or phone, and an item.");
  }
  if (!offer.amount || offer.amount <= 0) {
    throw new Error("Enter an offer amount greater than $0.");
  }

  const next = [offer, ...current];
  await writeAll(next, `New offer on ${offer.listingTitle || offer.listingId}`);
  return offer;
}

export async function updateOfferStatus(id, { status, counterAmount, counterNote }) {
  const current = await readCurrent();
  const idx = current.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Offer not found");

  const updated = {
    ...current[idx],
    status: status || current[idx].status,
    counterAmount:
      counterAmount !== undefined ? Number(counterAmount) || null : current[idx].counterAmount,
    counterNote: counterNote !== undefined ? counterNote : current[idx].counterNote,
  };

  current[idx] = updated;
  await writeAll(current, `Offer ${id} -> ${updated.status}`);
  return updated;
}

export async function deleteOffer(id) {
  const current = await readCurrent();
  const idx = current.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Offer not found");

  const next = current.filter((o) => o.id !== id);
  await writeAll(next, `Delete offer ${id}`);
  return { deleted: true };
}
