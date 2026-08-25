import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Demo placeholder portraits for Team/Testimonials (client confirmed
    // 2026-08-21 stock images are fine for this not-live demo site).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Security headers belong here, not in netlify.toml's [[headers]] -
  // confirmed live (curl against both a dynamic and a statically
  // generated route) that with @netlify/plugin-nextjs, every response is
  // served through Next's own handler ("Cache-Status: Next.js" on every
  // route, including ones the build marks static), which never passes
  // through Netlify's TOML-based header injection. This is the
  // framework-native mechanism instead, so it actually applies regardless
  // of hosting platform.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking protection - matters concretely here since
          // /admin/login is a real password form.
          { key: "X-Frame-Options", value: "DENY" },
          // Don't leak full URLs (including query params) to external
          // sites when a visitor clicks an outbound link.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Explicitly deny browser features this site has no use for.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
