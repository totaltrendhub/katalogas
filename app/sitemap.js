// app/sitemap.js

import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://elektroninesvizijos.lt";

export default async function sitemap() {
  const urls = [];

  const pushUrl = (path, lastModified) => {
    urls.push({
      url: `${BASE_URL}${path}`,
      lastModified: lastModified || new Date().toISOString(),
    });
  };

  // --- 1) Statiniai puslapiai ---

  pushUrl("/"); // homepage / VIP zona
  pushUrl("/kainos");
  pushUrl("/apie-kataloga");
  pushUrl("/kontaktai");
  pushUrl("/taisykles");
  pushUrl("/privatumas");
  pushUrl("/straipsniai");

  // --- 2) Kategorijos iš DB ---

  try {
    const supabase = await supabaseServer();

    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("slug");

    if (catError) {
      console.error("sitemap categories ERROR:", catError);
    } else if (categories) {
      for (const cat of categories) {
        if (!cat.slug) continue;
        if (cat.slug === "vip-zona") continue; // homepage jau turim

        pushUrl(`/${cat.slug}`);
      }
    }

    // --- 3) Straipsniai (tik publikuoti) ---

    const { data: articles, error: artError } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at, published")
      .eq("published", true);

    if (artError) {
      console.error("sitemap articles ERROR:", artError);
    } else if (articles) {
      for (const article of articles) {
        if (!article.slug) continue;

        const lm =
          article.updated_at ||
          article.published_at ||
          new Date().toISOString();

        pushUrl(`/straipsniai/${article.slug}`, lm);
      }
    }
  } catch (err) {
    console.error("sitemap FATAL ERROR:", err);
  }

  return urls;
}
