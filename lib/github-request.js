// Small retry wrapper around GitHub's Contents API, shared by
// admin-listings.js, admin-offers.js, and analytics.js - all three read
// and write their data file straight to GitHub (see admin-listings.js for
// the full explanation of why), and all three were seeing the exact same
// flakiness: GitHub occasionally answers a normal, well-formed request
// with a transient 502/503/504 ("no server is currently available",
// timeouts under load) that has nothing to do with the request itself and
// clears up if you just try again a moment later. Without this, that
// error surfaced straight to whoever was mid-checkout, submitting an
// offer, or saving a listing edit, and they'd have to notice and retry it
// by hand - sometimes several times. This retries those specific
// transient statuses automatically, with a short backoff, before ever
// bothering a real person with it.
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

export async function githubFetch(url, options, { retries = 3, baseDelayMs = 400 } = {}) {
  let lastResponse = null;
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || !RETRYABLE_STATUSES.has(res.status)) {
        return res;
      }
      lastResponse = res;
    } catch (err) {
      // A network-level failure (DNS hiccup, connection reset) is just as
      // transient as a 503 - worth the same retry treatment rather than
      // failing the whole request on the first blip.
      lastError = err;
    }

    if (attempt < retries) {
      // Every attempt is a real, separate response/error - drain the
      // failed response body so the connection can be reused, without
      // caring what it says (we already know it's retryable).
      if (lastResponse) await lastResponse.text().catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * (attempt + 1)));
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError;
}
