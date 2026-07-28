import { BUSINESS } from "@/lib/constants";

export default function PhoneBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-9 items-center justify-center gap-2 bg-espresso-950 px-4 text-[13px] text-parchment-100">
      <span className="hidden sm:inline text-parchment-100/70">
        {BUSINESS.name} &middot; {BUSINESS.address}
      </span>
      <span className="hidden sm:inline text-parchment-100/30">|</span>
      <a
        href={`tel:${BUSINESS.phoneHref}`}
        className="flex items-center gap-1.5 font-medium tracking-wide text-clay-400 transition-colors hover:text-clay-500"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.3 21 3 13.7 3 4.9c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z" />
        </svg>
        Call {BUSINESS.phoneDisplay}
      </a>
    </div>
  );
}
