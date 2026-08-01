import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import ChessGame from "@/components/ChessGame";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-6xl font-semibold text-espresso-200">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-espresso-950">
        We couldn&rsquo;t find that piece
      </h1>
      <p className="mt-2 text-sm text-espresso-600">
        It may have sold, or the link may be out of date. Browse the current
        collection, or call the shop and we&rsquo;ll help you find it.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-espresso-950 px-6 py-3 text-sm font-semibold text-parchment-50"
        >
          Back to Shop
        </Link>
        <a
          href={`tel:${BUSINESS.phoneHref}`}
          className="rounded-full border border-espresso-900/20 px-6 py-3 text-sm font-semibold text-espresso-950"
        >
          Call {BUSINESS.phoneDisplay}
        </a>
      </div>

      <ChessGame />
    </div>
  );
}
