// app/robots.js

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://elektroninesvizijos.lt";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/auth",
          "/auth/login",
          "/dashboard",
          "/dashboard/*",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
