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
          d="M12 21s-6.7-4.35-9.3-8.1C.8 9.9 1.7 6.4 4.7 5.1c2.2-.95 4.4 0 5.8 1.9.3.4.9.4 1.2 0 1.4-1.9 3.6-2.85 5.8-1.9 3 1.3 3.9 4.8 2 7.8C18.7 16.65 12 21 12 21z"
        />
      </svg>
    </button>
  );
}
