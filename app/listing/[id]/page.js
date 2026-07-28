import { notFound } from "next/navigation";
import Link from "next/link";
import ImageGallery from "@/components/ImageGallery";
import ListingCard from "@/components/ListingCard";
import LikeButton from "@/components/LikeButton";
import OfferForm from "@/components/OfferForm";
import BuyButton from "@/components/BuyButton";
import {
  getListingById,
  getRelatedListings,
  formatPrice,
  formatDimensions,
} from "@/lib/listings";
import { CATEGORY_MAP, BUSINESS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const listing = getListingById(params.id);
  if (!listing) return {};
  return {
    title: listing.title,
    description: listing.description?.slice(0, 155),
    openGraph: {
      title: listing.title,
      description: listing.description?.slice(0, 155),
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
  };
}

export default function ListingPage({ params }) {
  const listing = getListingById(params.id);
  if (!listing || listing.status === "hidden") notFound();

  const related = getRelatedListings(listing, 4);
  const onSale =
    listing.compareAtPrice && listing.compareAtPrice > listing.price;
  const dims = formatDimensions(listing.dimensions);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: listing.price,
      availability:
        listing.status === "sold"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: BUSINESS.name },
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <nav className="mb-6 text-xs text-espresso-500">
        <Link href="/" className="hover:text-clay-600">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/category/${listing.category}`} className="hover:text-clay-600">
          {CATEGORY_MAP[listing.category]?.label || "Antiques"}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-espresso-700">{listing.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ImageGallery images={listing.images} alt={listing.title} />

        <div>
          {listing.status === "sold" && (
            <p className="mb-2 inline-block rounded-full bg-espresso-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-parchment-50">
              Sold
            </p>
          )}
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay-600">
              {CATEGORY_MAP[listing.category]?.label} &middot; {listing.era}
            </p>
            <LikeButton listingId={listing.id} size="lg" />
          </div>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-espresso-950">
            {listing.title}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-espresso-950">
              {formatPrice(listing.price)}
            </span>
            {onSale && (
              <span className="text-base text-espresso-500 line-through">
                {formatPrice(listing.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-start gap-3">
            {listing.status === "sold" ? (
              <p className="rounded-full bg-espresso-100 px-6 py-3 text-sm font-semibold text-espresso-700">
                This piece has sold
              </p>
            ) : listing.price > 0 ? (
              <BuyButton listingId={listing.id} />
            ) : (
              <a
                href={`tel:${BUSINESS.phoneHref}`}
                className="rounded-full bg-espresso-950 px-6 py-3 text-sm font-semibold text-parchment-50 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-cardHover"
              >
                Call to Inquire &middot; {BUSINESS.phoneDisplay}
              </a>
            )}
            <a
              href={`mailto:${BUSINESS.email}?subject=${encodeURIComponent(
                "Inquiry: " + listing.title
              )}`}
              className="rounded-full border border-espresso-900/20 px-6 py-3 text-sm font-semibold text-espresso-950 transition-colors hover:bg-espresso-950 hover:text-parchment-50"
            >
              Email Us
            </a>
          </div>

          {listing.status !== "sold" && (
            <div className="mt-4">
              <OfferForm listingId={listing.id} listingTitle={listing.title} />
            </div>
          )}

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-espresso-900/10 pt-6 text-sm">
            {dims && (
              <div>
                <dt className="text-espresso-500">Dimensions</dt>
                <dd className="mt-0.5 font-medium text-espresso-900">{dims}</dd>
              </div>
            )}
            {listing.condition && (
              <div>
                <dt className="text-espresso-500">Condition</dt>
                <dd className="mt-0.5 font-medium text-espresso-900">
                  {listing.condition}
                </dd>
              </div>
            )}
            {listing.origin && (
              <div>
                <dt className="text-espresso-500">Origin</dt>
                <dd className="mt-0.5 font-medium text-espresso-900">
                  {listing.origin}
                </dd>
              </div>
            )}
            {listing.era && (
              <div>
                <dt className="text-espresso-500">Era</dt>
                <dd className="mt-0.5 font-medium text-espresso-900">{listing.era}</dd>
              </div>
            )}
          </dl>

          {listing.description && (
            <div className="mt-8 border-t border-espresso-900/10 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-espresso-700">
                Description
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-espresso-800">
                {listing.description}
              </p>
            </div>
          )}

          {listing.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-espresso-100 px-3 py-1 text-xs text-espresso-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-espresso-950">
            You May Also Like
          </h2>
          <div className="listing-grid">
            {related.map((l) => (
              <ListingCard listing={l} key={l.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
