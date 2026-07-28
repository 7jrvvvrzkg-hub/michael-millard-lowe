"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, alt }) {
  const [active, setActive] = useState(0);
  const list = images && images.length ? images : [];

  if (!list.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-espresso-100 text-espresso-500">
        No Photo Available
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-espresso-100 shadow-card">
        <Image
          src={list[active]}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-cover transition-opacity duration-300"
          priority
        />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto scrollbar-none">
          {list.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                active === i
                  ? "ring-espresso-950"
                  : "ring-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
