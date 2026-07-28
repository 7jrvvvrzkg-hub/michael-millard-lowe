#!/usr/bin/env node
// Generates a new ADMIN_PASSWORD_HASH value.
//
// Usage:
//   npm run hash-password -- "your new password"
//
// Copy the printed value into ADMIN_PASSWORD_HASH in .env.local (for local
// dev) and into your Vercel project's Environment Variables (for the live
// site), then redeploy.

import crypto from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your new password"');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");

console.log("\nNew ADMIN_PASSWORD_HASH value:\n");
console.log(`${salt}:${hash}`);
console.log("\nPaste that into .env.local and your Vercel env vars.\n");
