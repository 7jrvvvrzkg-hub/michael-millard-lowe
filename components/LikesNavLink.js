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
          d="M4.36 1.84 3.21 2.46 2.32 3.24 1.11 5.2 0.72 7.77 1.34 10.52 2.4 12.53 4.55 15.22 12.11 22.44 12.36 22.47 18.83 15.5 21.54 11.78 22.64 9.65 23.11 8.11 23.25 6.46 22.86 4.61 21.94 3.16 20.7 2.18 19.08 1.59 17.43 1.53 15.92 1.92 14.49 2.74 13.26 3.91 12.0 5.73 10.38 3.35 8.61 2.04 6.77 1.5 5.53 1.53 Z"
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
