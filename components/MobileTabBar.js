"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLikes } from "@/hooks/useLikes";
import { BUSINESS } from "@/lib/constants";

const ICONS = {
  home: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"
    />
  ),
  shop: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 9h16l-1 10.5a1 1 0 0 1-1 .9H6a1 1 0 0 1-1-.9L4 9Zm4 0V7a4 4 0 0 1 8 0v2"
    />
  ),
  likes: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.36 1.84 3.21 2.46 2.32 3.24 1.11 5.2 0.72 7.77 1.34 10.52 2.4 12.53 4.55 15.22 12.11 22.44 12.36 22.47 18.83 15.5 21.54 11.78 22.64 9.65 23.11 8.11 23.25 6.46 22.86 4.61 21.94 3.16 20.7 2.18 19.08 1.59 17.43 1.53 15.92 1.92 14.49 2.74 13.26 3.91 12.0 5.73 10.38 3.35 8.61 2.04 6.77 1.5 5.53 1.53 Z"
    />
  ),
  call: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.3 21 3 13.7 3 4.9c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z"
    />
  ),
  owner: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0"
    />
  ),
};

function TabIcon({ name, active }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-espresso-950" : "text-espresso-500"}`}
      fill="none"
      strokeWidth="2"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const { likes, hydrated } = useLikes();
  const count = hydrated ? likes.length : 0;

  if (pathname?.startsWith("/admin")) return null;

  const tabs = [
    { href: "/", label: "Home", icon: "home", match: (p) => p === "/" },
    {
      href: "/category/all",
      label: "Shop",
      icon: "shop",
      match: (p) => p.startsWith("/category") || p.startsWith("/search"),
    },
    {
      href: "/likes",
      label: "Likes",
      icon: "likes",
      match: (p) => p.startsWith("/likes"),
      badge: count,
    },
    {
      href: `tel:${BUSINESS.phoneHref}`,
      label: "Call",
      icon: "call",
      match: () => false,
      external: true,
    },
    {
      href: "/admin",
      label: "Owner",
      icon: "owner",
      match: (p) => p.startsWith("/admin"),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-espresso-900/10 bg-parchment-50/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const active = tab.match(pathname || "");
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium"
            >
              <TabIcon name={tab.icon} active={active} />
              <span className={active ? "text-espresso-950" : "text-espresso-500"}>
                {tab.label}
              </span>
              {tab.badge > 0 && (
                <span className="absolute right-[26%] top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-clay-600 px-1 text-[9px] font-semibold text-parchment-50">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
