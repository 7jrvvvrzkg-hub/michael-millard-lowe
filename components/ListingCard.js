import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/listings";
import { CATEGORY_MAP } from "@/lib/constants";
import LikeButton from "./LikeButton";

export default function ListingCard({ listing, priority = false }) {
  const image = listing.images?.[0];
  const onSale =
    listing.compareAtPrice && listing.compareAtPrice > listing.price;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block animate-fadeInUp"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-espresso-100/40 shadow-card transition-shadow duration-300 group-hover:shadow-cardHover">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-espresso-100 text-espresso-500">
            No Photo
          </div>
        )}

        {onSale && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-clay-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-parchment-50">
            Sale
          </span>
        )}

        <LikeButton
          listingId={listing.id}
          className="absolute right-2.5 top-2.5"
        />
        {listing.status === "sold" && (
          <span className="absolute inset-0 flex items-center justify-center bg-espresso-950/50">
            <span className="rounded-full bg-parchment-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-espresso-950">
              Sold
            </span>
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-espresso-950/70 to-transparent px-2.5 py-2">
          <span className="h-4 w-4 shrink-0 rounded-full bg-parchment-50/90 bg-[url('/logo-mark.png')] bg-cover" />
          <span className="truncate text-[11px] font-medium text-parchment-50">
            {CATEGORY_MAP[listing.category]?.label || "Antiques"}
          </span>
        </div>
      </div>

      <div className="mt-2.5 space-y-0.5">
        <p className="truncate text-sm text-espresso-900">{listing.title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-espresso-950">
            {formatPrice(listing.price)}
          </span>
          {onSale && (
            <span className="text-xs text-espresso-500 line-through">
              {formatPrice(listing.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
