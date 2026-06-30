import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/mu-uganda-portal-16x",
    },
    sitemap: "https://mothers-union-buganda.vercel.app/sitemap.xml",
  };
}
