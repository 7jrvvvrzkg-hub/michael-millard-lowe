"use client";

import { useLikes } from "@/hooks/useLikes";

export default function LikeButton({ listingId, className = "", size = "md" }) {
  const { isLiked, toggleLike, hydrated } = useLikes();
  const liked = hydrated && isLiked(listingId);
  const dims = size === "lg" ? "h-10 w-10" : "h-7 w-7";
  const iconDims = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      aria-label={liked ? "Remove from likes" : "Save to likes"}
      aria-pressed={liked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(listingId);
      }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-110 active:scale-95 ${dims} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`${iconDims} transition-colors ${
          liked ? "fill-clay-600 stroke-clay-600" : "fill-none stroke-espresso-800"
        }`}
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.36 1.84 3.21 2.46 2.32 3.24 1.11 5.2 0.72 7.77 1.34 10.52 2.4 12.53 4.55 15.22 12.11 22.44 12.36 22.47 18.83 15.5 21.54 11.78 22.64 9.65 23.11 8.11 23.25 6.46 22.86 4.61 21.94 3.16 20.7 2.18 19.08 1.59 17.43 1.53 15.92 1.92 14.49 2.74 13.26 3.91 12.0 5.73 10.38 3.35 8.61 2.04 6.77 1.5 5.53 1.53 Z"
        />
      </svg>
    </button>
  );
}
