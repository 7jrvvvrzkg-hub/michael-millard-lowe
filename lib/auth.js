// Minimal, dependency-free admin auth: a scrypt password check plus a
// signed, expiring session cookie (HMAC-SHA256). No external auth library,
// no database row for "users" - there's exactly one admin.

const crypto = require("node:crypto");

const SESSION_COOKIE = "mml_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to .env.local (see .env.example)."
    );
  }
  return secret;
}

// True only when ADMIN_PASSWORD_HASH is actually set and well-formed. Used
// to tell "wrong password" apart from "this deployment was never given a
// password" - the two look identical to a user unless we check explicitly,
// and the second one is a very common setup mistake (env vars added
// locally but never added in Vercel's project settings).
function isAdminConfigured() {
  const stored = process.env.ADMIN_PASSWORD_HASH || "";
  const [salt, hash] = stored.split(":");
  return Boolean(salt && hash && process.env.SESSION_SECRET);
}

function verifyPassword(password) {
  const stored = process.env.ADMIN_PASSWORD_HASH || "";
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || !password) return false;

  const attempt = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (attempt.length !== expected.length) return false;
  return crypto.timingSafeEqual(attempt, expected);
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function createSessionToken() {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${expires}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  let expectedBuf, sigBuf;
  try {
    expectedBuf = Buffer.from(sign(payload), "hex");
    sigBuf = Buffer.from(sig, "hex");
  } catch {
    return false;
  }
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  return true;
}

// Works with the cookies() store from next/headers (Server Components,
// Route Handlers) which exposes .get(name)?.value
function isAuthed(cookieStore) {
  try {
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    return verifySessionToken(token);
  } catch {
    return false;
  }
}

module.exports = {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS: SESSION_TTL_MS / 1000,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  isAuthed,
  isAdminConfigured,
};
