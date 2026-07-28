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
          d="M7.9 3.7 6.2 4.6 4.9 6.2 4.4 7.9 4.5 9.5 4.9 10.6 5.5 11.5 6.6 12.5 7.8 13.2 11.5 18.4 11.7 19.1 12.1 19.3 12.7 18.1 16.2 13.2 17.8 12.2 18.8 11.1 19.5 9.5 19.5 7.3 19.1 6.2 18.5 5.3 17.4 4.3 16.1 3.7 14.2 3.5 12.2 4.2 9.8 3.5 Z"
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
