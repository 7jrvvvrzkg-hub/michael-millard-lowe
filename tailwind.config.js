/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          950: "#120e0b",
          900: "#17130f",
          800: "#241d17",
          700: "#332821",
          600: "#4a3a2e",
          500: "#6b5540",
          // 100/200/300/400 were referenced throughout the site (card
          // placeholders, skeleton loaders, badges, empty states) but were
          // never actually defined here - Tailwind silently drops classes
          // for undefined shades, so every one of those elements has been
          // rendering with NO background at all. That's most of what read
          // as flat "white on off-white": placeholders that were supposed
          // to have a soft warm tan tint had nothing. Filling out the ramp
          // fixes it.
          400: "#93764f",
          300: "#c7a877",
          200: "#ddc7a1",
          100: "#ecdfc9",
        },
        // Aligned to the shop's actual monogram ink color (a warm rust
        // orange) so the brand accent used across the site - sale badges,
        // links, buttons - genuinely matches the logo instead of an
        // unrelated terracotta guess.
        clay: {
          400: "#d9824c",
          500: "#c2541b",
          600: "#9c4216",
        },
        // Deepened from the original near-white scale (50 was #fbf8f3,
        // barely distinguishable from stark white) into a warmer, richer
        // "aged paper" cream range so surfaces actually read as antique
        // parchment instead of flat off-white.
        parchment: {
          50: "#f8f1e3",
          100: "#eeddba",
          200: "#e0c48c",
          300: "#cda868",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(18,14,11,0.08), 0 8px 24px rgba(18,14,11,0.06)",
        cardHover: "0 4px 10px rgba(18,14,11,0.12), 0 16px 36px rgba(18,14,11,0.14)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        // Continuous "conveyor belt" scroll for the reviews carousel - the
        // track renders the review list twice back to back and slides
        // exactly half its own width, so the loop point is invisible.
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.5s ease-out both",
        blink: "blink 1s step-start infinite",
        shimmer: "shimmer 1.4s ease-in-out infinite",
        marquee: "marquee 46s linear infinite",
      },
    },
  },
  plugins: [],
};
