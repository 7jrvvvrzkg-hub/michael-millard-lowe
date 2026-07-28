"use client";

// Anonymous, no-login "likes" - saved to the browser via localStorage rather
// than a customer account (there isn't one). Works instantly, survives
// reloads, and needs no backend. `mml-likes-changed` keeps every component
// using this hook in sync the moment one of them toggles a like.

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mml_likes";
const EVENT_NAME = "mml-likes-changed";

function readLikes() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLikes(ids) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable (private browsing, etc.) - fail silently.
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: ids }));
}

export function useLikes() {
  const [likes, setLikes] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLikes(readLikes());
    setHydrated(true);

    function handleCustom(e) {
      setLikes(e.detail || readLikes());
    }
    function handleStorage() {
      setLikes(readLikes());
    }

    window.addEventListener(EVENT_NAME, handleCustom);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const isLiked = useCallback((id) => likes.includes(id), [likes]);

  const toggleLike = useCallback((id) => {
    setLikes((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      writeLikes(next);
      return next;
    });
  }, []);

  return { likes, isLiked, toggleLike, hydrated };
}
