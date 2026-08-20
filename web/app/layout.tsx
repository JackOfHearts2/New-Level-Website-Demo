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
    "New Level — a South Florida real estate group matching standout properties to the moments they're made for.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
