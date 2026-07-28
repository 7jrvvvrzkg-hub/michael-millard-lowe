import { REVIEWS, GOOGLE_RATING_SUMMARY } from "@/lib/reviews";

function Star({ filled }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-3.5 w-3.5 ${filled ? "fill-clay-500" : "fill-espresso-200"}`}
    >
      <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
    </svg>
  );
}

function ReviewCard({ review }) {
  return (
    <figure className="w-[320px] shrink-0 rounded-2xl border border-espresso-900/10 bg-parchment-50 p-5 shadow-card sm:w-[380px]">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < review.rating} />
        ))}
      </div>
      <blockquote className="mt-3 line-clamp-4 text-sm leading-relaxed text-espresso-700">
        &ldquo;{review.text}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-2 text-sm font-semibold text-espresso-950">
        {review.name}
        <span className="text-xs font-normal text-espresso-500">
          &middot; Google review
        </span>
      </figcaption>
    </figure>
  );
}

// A continuous, always-moving "conveyor belt" of reviews rather than a
// one-at-a-time swapper - the shop has 46+ reviews on Google, so this
// reads as a steady stream of praise rather than asking visitors to click
// through them one by one. Built with a plain CSS animation (no JS
// timers/state) so it never stutters and needs no client-side hydration.
export default function ReviewsCarousel() {
  // Rendered twice, back to back, so the marquee animation (which slides
  // exactly -50% of the track's width) loops with no visible seam.
  const loop = [...REVIEWS, ...REVIEWS];

  return (
    <section className="border-y border-espresso-900/10 bg-parchment-200/30 py-14">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">
            Reviews
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-espresso-950">
            What Our Customers Say
          </h2>
        </div>
        <a
          href={GOOGLE_RATING_SUMMARY.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-espresso-900/15 bg-parchment-50 px-4 py-2 text-sm font-semibold text-espresso-900 shadow-card transition-colors hover:bg-parchment-100"
        >
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                filled={i < Math.round(GOOGLE_RATING_SUMMARY.average)}
              />
            ))}
          </span>
          {GOOGLE_RATING_SUMMARY.average} ({GOOGLE_RATING_SUMMARY.count}{" "}
          Google reviews)
        </a>
      </div>

      <div className="group relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="flex w-max gap-5 animate-marquee group-hover:[animation-play-state:paused]">
          {loop.map((review, i) => (
            <ReviewCard review={review} key={`${review.name}-${i}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
