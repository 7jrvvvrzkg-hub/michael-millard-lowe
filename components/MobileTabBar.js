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
      d="M7.9 3.7 6.2 4.6 4.9 6.2 4.4 7.9 4.5 9.5 4.9 10.6 5.5 11.5 6.6 12.5 7.8 13.2 11.5 18.4 11.7 19.1 12.1 19.3 12.7 18.1 16.2 13.2 17.8 12.2 18.8 11.1 19.5 9.5 19.5 7.3 19.1 6.2 18.5 5.3 17.4 4.3 16.1 3.7 14.2 3.5 12.2 4.2 9.8 3.5 Z"
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
