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
          d="M7.9 3.7 6.2 4.6 4.9 6.2 4.4 7.9 4.5 9.5 4.9 10.6 5.5 11.5 6.6 12.5 7.8 13.2 11.5 18.4 11.7 19.1 12.1 19.3 12.7 18.1 16.2 13.2 17.8 12.2 18.8 11.1 19.5 9.5 19.5 7.3 19.1 6.2 18.5 5.3 17.4 4.3 16.1 3.7 14.2 3.5 12.2 4.2 9.8 3.5 Z"
        />
      </svg>
    </button>
  );
}
