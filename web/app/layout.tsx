import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import { AmbientBackground } from "@/components/ambient-background";
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

const SITE_TITLE = "New Level · Real Estate. Redefined.";
const SITE_DESCRIPTION =
  "New Level: a South Florida Real Estate group matching standout properties to the moments they're made for.";

export const metadata: Metadata = {
  // metadataBase is required for Next to resolve the relative OG/Twitter
  // image URL below into an absolute one. Deliberately NOT hardcoding a
  // domain here - this is a Netlify preview deploy, not the final site
  // URL (the client has explicitly deferred domain/DNS work). Netlify
  // sets URL/DEPLOY_PRIME_URL at build time to whatever this exact deploy's
  // real address is, so this stays correct automatically through preview
  // URL changes and any eventual domain move, with no code change needed.
  metadataBase: new URL(
    process.env.URL || process.env.DEPLOY_PRIME_URL || "http://localhost:3000"
  ),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // No OpenGraph/Twitter card metadata existed anywhere on the site before
  // this - sharing any page's link (Slack, iMessage, social) produced an
  // uncontrolled or blank preview. These are site-wide defaults every page
  // inherits unless it sets its own (see property/page.tsx for an example
  // of a page overriding these with content-specific values).
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "New Level",
    images: ["/photos/00.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/photos/00.jpg"],
  },
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
      <body className="min-h-full flex flex-col">
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
