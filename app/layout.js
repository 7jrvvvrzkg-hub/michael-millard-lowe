import "./globals.css";
import PhoneBar from "@/components/PhoneBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import { BUSINESS, HOURS_SCHEMA } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BUSINESS.name} | ${BUSINESS.tagline}`,
    template: `%s | ${BUSINESS.name}`,
  },
  description:
    "Michael Millard-Lowe Antiques is a nationally known provider of fine European and American antiques, sourced almost exclusively in France and Italy. Furniture, lighting, art, mirrors and decorative objects for sale in Norfolk, VA.",
  keywords: [
    "antiques",
    "antique furniture",
    "Norfolk VA antiques",
    "French antiques",
    "European antiques",
    "Michael Millard-Lowe",
    "Louis XV",
    "Louis XVI",
    "Napoleon III",
    "antique mirrors",
    "antique lighting",
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: `${BUSINESS.name} | ${BUSINESS.tagline}`,
    description:
      "Fine European & American antiques - furniture, lighting, art and decorative objects, curated from France and Italy.",
    url: siteUrl,
    siteName: BUSINESS.name,
    type: "website",
    images: ["/logo-mark.png"],
  },
  twitter: {
    card: "summary",
    title: `${BUSINESS.name} | ${BUSINESS.tagline}`,
    description: BUSINESS.tagline,
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AntiqueStore",
  name: BUSINESS.name,
  description:
    "Nationally known provider of fine European and American antiques, sourced almost exclusively in France and Italy.",
  telephone: BUSINESS.phoneDisplay,
  email: BUSINESS.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.addressLine1,
    addressLocality: "Norfolk",
    addressRegion: "VA",
    addressCountry: "US",
  },
  url: siteUrl,
  sameAs: [BUSINESS.chairishUrl, BUSINESS.instagramUrl],
  openingHoursSpecification: HOURS_SCHEMA,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-parchment-50 pb-16 pt-9 font-sans text-espresso-950 antialiased md:pb-0">
        <PhoneBar />
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileTabBar />
      </body>
    </html>
  );
}
