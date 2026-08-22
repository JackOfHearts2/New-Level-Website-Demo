import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";

// Matches --font-display / --font-body in the vanilla site's styles.css —
// Poppins for headings/buttons/labels, DM Sans for body copy.
const poppins = Poppins({
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "New Level · Real Estate. Redefined.",
  description:
    "New Level: a South Florida Real Estate group matching standout properties to the moments they're made for.",
};

// Runs before paint to set the dark class synchronously — avoids a flash of
// the wrong theme on load. Reads a stored preference first, falling back to
// the OS setting. suppressHydrationWarning on <html> below is required
// because this script mutates className before React hydrates.
const themeInitScript = `(function(){try{var s=localStorage.getItem("theme");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
