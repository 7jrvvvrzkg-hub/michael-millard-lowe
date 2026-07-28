import Image from "next/image";

// The owner's own words about the shop, used verbatim - this is the
// closest thing to a mission statement/about page the site has, so it
// gets a proper, prominent section rather than being buried in the footer.
const BLURB = [
  "Michael Millard-Lowe Antiques is a nationally known provider of fine antiques. We source our unique pieces almost exclusively in France and Italy. We bring the flavor and style of the Continent to the friends of our shop.",
  "Unique, different and stylish are the words we live by. Only the best, curated antiques and curiosities are offered for sale to the friends of our shop.",
  "As a licensed appraiser and auctioneer, we accurately represent and guarantee all our products. Buy with confidence.",
];

export default function StorySection() {
  return (
    <section className="border-y border-espresso-900/10 bg-parchment-100/70">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
        <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-2xl shadow-cardHover md:order-1">
          <Image
            src="/shop-interior.webp"
            alt="Inside the Michael Millard-Lowe Antiques showroom"
            fill
            sizes="(min-width: 768px) 45vw, 90vw"
            className="object-cover"
          />
        </div>

        <div className="order-1 md:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">
            Our Story
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-espresso-950 sm:text-4xl">
            Fine Antiques, Sourced from the Continent
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-espresso-700">
            {BLURB.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
