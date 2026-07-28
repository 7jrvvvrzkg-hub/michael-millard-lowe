#!/usr/bin/env node
// Chairish connector - run manually with: npm run sync:chairish
//
// Scrapes https://www.chairish.com/shop/michaelmillardlowe and merges any
// new or changed items straight into data/listings.json. This is the most
// reliable way to run the connector, since it uses your own machine's
// network connection rather than Vercel's serverless functions (which some
// sites are stricter with). It writes directly to the local file - commit
// and push the result to deploy it.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scrapeShop } from "../lib/chairish.js";
import { categorizeListing } from "../lib/categorize.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "listings.json");
const SHOP_URL = "https://www.chairish.com/shop/michaelmillardlowe";

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uniqueId(base, existingIds) {
  let id = base || `listing-${Date.now()}`;
  let n = 2;
  while (existingIds.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

async function main() {
  console.log(`Scraping ${SHOP_URL} ...\n`);
  const current = JSON.parse(await fs.readFile(DATA_PATH, "utf-8"));
  const { results, errors } = await scrapeShop(SHOP_URL);

  console.log(`Fetched ${results.length} listings (${errors.length} errors).`);

  const bySourceId = new Map(
    current.filter((l) => l.sourceProductId).map((l) => [l.sourceProductId, l])
  );
  const existingIds = new Set(current.map((l) => l.id));

  let added = 0;
  let updated = 0;
  const merged = [...current];

  for (const item of results) {
    item.category = item.category || categorizeListing(item);
    const existing = bySourceId.get(item.sourceProductId);

    if (existing) {
      const idx = merged.findIndex((l) => l.id === existing.id);
      merged[idx] = {
        ...existing,
        ...item,
        id: existing.id,
        createdAt: existing.createdAt,
      };
      updated += 1;
    } else {
      const id = uniqueId(slugify(item.title), existingIds);
      existingIds.add(id);
      merged.unshift({ ...item, id, createdAt: new Date().toISOString() });
      added += 1;
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(merged, null, 2) + "\n", "utf-8");

  console.log(`\nDone. Added ${added}, updated ${updated}, total ${merged.length}.`);
  if (errors.length) {
    console.log("\nSome pages could not be parsed:");
    errors.forEach((e) => console.log(`  - ${e.url}: ${e.error}`));
  }
  console.log(
    "\nReview data/listings.json, then commit & push to publish these changes."
  );
}

main().catch((err) => {
  console.error("Chairish sync failed:", err);
  process.exit(1);
});
