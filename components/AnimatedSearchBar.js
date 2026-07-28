"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SEARCH_PROMPTS } from "@/lib/constants";

const TYPE_MS = 65;
const DELETE_MS = 30;
const HOLD_MS = 1400;
const GAP_MS = 350;

export default function AnimatedSearchBar({ className = "" }) {
  const [value, setValue] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId;

    const tick = () => {
      const phrase = SEARCH_PROMPTS[phraseIndex % SEARCH_PROMPTS.length];

      if (!deleting) {
        charIndex += 1;
        setPlaceholderText(phrase.slice(0, charIndex));
        if (charIndex >= phrase.length) {
          deleting = true;
          timeoutId = setTimeout(tick, HOLD_MS);
          return;
        }
        timeoutId = setTimeout(tick, TYPE_MS);
      } else {
        charIndex -= 1;
        setPlaceholderText(phrase.slice(0, charIndex));
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex += 1;
          timeoutId = setTimeout(tick, GAP_MS);
          return;
        }
        timeoutId = setTimeout(tick, DELETE_MS);
      }
    };

    timeoutId = setTimeout(tick, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`group relative flex w-full items-center rounded-full border border-espresso-700/15 bg-parchment-50 px-4 py-2.5 transition-shadow focus-within:shadow-cardHover hover:shadow-card ${className}`}
      role="search"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 text-espresso-600"
        fill="none"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <div className="relative ml-2.5 flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-sm text-espresso-900 outline-none placeholder:text-transparent"
          aria-label="Search antiques"
        />
        {!value && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm text-espresso-600/70"
          >
            Search for &ldquo;{placeholderText}
            <span className="ml-px inline-block w-[2px] animate-blink bg-espresso-600/70 align-middle">
              &nbsp;
            </span>
            &rdquo;
          </span>
        )}
      </div>
    </form>
  );
}
