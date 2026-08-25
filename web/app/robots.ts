import type { MetadataRoute } from "next";

// This is a demo/preview deploy, not the real launched site (see CLAUDE.md
// "What this is" / the client's roadmap - domain and go-live work are
// deliberately deferred). Disallowing all crawling here prevents search
// engines from indexing placeholder copy, fake reviews, and demo pricing
// before the real site actually launches. Revisit this (allow indexing,
// add a real sitemap) once the client is ready to go live for real.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
