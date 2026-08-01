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

// Plain ANSI color codes for a bit of terminal color in the sync report -
// no dependency needed for something this small.
const color = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  purple: "\x1b[35m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
};

async function main() {
  const startedAt = Date.now();
  console.log(`Scraping ${SHOP_URL} ...\n`);
  const current = JSON.parse(await fs.readFile(DATA_PATH, "utf-8"));
  const { results, errors, activeProductIds } = await scrapeShop(SHOP_URL);

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

  // Mark items sold that have quietly vanished from the Chairish shop page
  // (Chairish removes sold items rather than labeling them, so a
  // previously-imported item's ID disappearing from activeProductIds is the
  // only real signal we have). Guarded the same way as the admin API route:
  // if activeProductIds looks suspiciously small compared to what we
  // already believed was active (e.g. a fetch failure), skip this pass
  // entirely rather than risk mass-marking everything sold.
  const previouslyActiveChairishCount = current.filter(
    (l) => l.source === "chairish" && l.status !== "sold"
  ).length;
  const activeIdsLookTrustworthy =
    activeProductIds &&
    (previouslyActiveChairishCount === 0 ||
      activeProductIds.size >= previouslyActiveChairishCount * 0.5);

  let markedSold = 0;
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

  await fs.writeFile(DATA_PATH, JSON.stringify(merged, null, 2) + "\n", "utf-8");

  const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  const checked = results.length + errors.length;

  console.log("");
  console.log(
    `${color.green}✓ ${checked} listing${checked === 1 ? "" : "s"} checked${color.reset}` +
      (activeProductIds ? ` (of ${activeProductIds.size} on Chairish)` : "")
  );
  if (added > 0) {
    console.log(`${color.purple}+ ${added} new listing${added === 1 ? "" : "s"} imported${color.reset}`);
  }
  if (updated > 0) {
    console.log(`${color.blue}↻ ${updated} listing${updated === 1 ? "" : "s"} updated${color.reset}`);
  }
  if (markedSold > 0) {
    console.log(`${color.green}● ${markedSold} listing${markedSold === 1 ? "" : "s"} marked sold${color.reset}`);
  }
  console.log(
    errors.length
      ? `${color.red}! ${errors.length} error${errors.length === 1 ? "" : "s"}${color.reset}`
      : `${color.dim}0 errors${color.reset}`
  );
  console.log(`${color.dim}Completed in ${elapsedSeconds}s${color.reset}`);

  if (activeProductIds && !activeIdsLookTrustworthy) {
    console.log(
      `\n${color.red}Skipped sold-detection this run${color.reset} - the shop page fetch looked incomplete ` +
        "(fewer active listings found than expected), so nothing was auto-marked " +
        "sold to avoid a false mass update. Try running the sync again."
    );
  }
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
