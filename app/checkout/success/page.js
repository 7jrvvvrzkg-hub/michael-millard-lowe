import Link from "next/link";

export const metadata = { title: "Order Confirmed" };

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay-600">
        Order Confirmed
      </p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso-950">
        Thank you for your purchase
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-espresso-700">
        We&apos;ve received your order and will be in touch shortly to
        arrange delivery or pickup. A receipt has been sent to your email.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-espresso-950 px-6 py-3 text-sm font-semibold text-parchment-50 shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-cardHover"
      >
        Continue Browsing
      </Link>
    </div>
  );
}
