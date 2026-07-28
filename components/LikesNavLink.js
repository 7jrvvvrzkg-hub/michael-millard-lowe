"use client";

import Link from "next/link";
import { useLikes } from "@/hooks/useLikes";

export default function LikesNavLink({ className = "" }) {
  const { likes, hydrated } = useLikes();
  const count = hydrated ? likes.length : 0;

  return (
    <Link
      href="/likes"
      aria-label="Your likes"
      className={`relative flex items-center gap-1.5 text-espresso-800 transition-colors hover:text-clay-600 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s-6.7-4.35-9.3-8.1C.8 9.9 1.7 6.4 4.7 5.1c2.2-.95 4.4 0 5.8 1.9.3.4.9.4 1.2 0 1.4-1.9 3.6-2.85 5.8-1.9 3 1.3 3.9 4.8 2 7.8C18.7 16.65 12 21 12 21z"
        />
      </svg>
      {count > 0 && (
        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-clay-600 px-1 text-[10px] font-semibold text-parchment-50">
          {count}
        </span>
      )}
    </Link>
  );
}
