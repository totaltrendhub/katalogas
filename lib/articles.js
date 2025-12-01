// lib/articles.js

import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Patikrinam ar vartotojas yra adminas (pagal profiles.is_admin)
 */
export async function isAdmin(userId) {
  if (!userId) return false;

  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("isAdmin ERROR:", error);
    return false;
  }

  return !!data?.is_admin;
}

/**
 * Straipsnių kategorijos (article_categories)
 * Naudojama:
 * - dashboard'o straipsnių sąraše,
 * - "Naujas straipsnis" formoje.
 */
export async function getArticleCategories() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("article_categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.warn("getArticleCategories ERROR:", error);
    return [];
  }

  return data || [];
}

/**
 * Visų straipsnių sąrašas admino dashboard'ui,
 * su pririštu kategorijos pavadinimu.
 */
export async function getAllArticlesWithCategory() {
  const supabase = await supabaseServer();

  // 1) Pasiimam visus straipsnius, be filtrų
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, slug, published, published_at, created_at, category_id")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("getAllArticlesWithCategory ERROR:", error);
    return [];
  }

  const rows = articles || [];

  // 2) Susirenkam kategorijų ID
  const categoryIds = [
    ...new Set(rows.map((a) => a.category_id).filter((id) => !!id)),
  ];

  let catsById = {};
  if (categoryIds.length > 0) {
    const { data: cats, error: catsError } = await supabase
      .from("article_categories")
      .select("id, name")
      .in("id", categoryIds);

    if (catsError) {
      console.warn("getAllArticlesWithCategory categories ERROR:", catsError);
    } else if (cats) {
      catsById = cats.reduce((acc, c) => {
        acc[c.id] = c;
        return acc;
      }, {});
    }
  }

  // 3) Grąžinam vieningą formą, kad React'e būtų paprasta
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    published: row.published,
    published_at: row.published_at,
    created_at: row.created_at,
    category_id: row.category_id,
    category_name: row.category_id ? catsById[row.category_id]?.name || null : null,
  }));
}

/**
 * Vienas straipsnis pagal ID – naudojamas dashboard'e redagavimui
 */
export async function getArticleById(id) {
  if (!id) return null;

  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        body,
        cover_image_url,
        meta_title,
        meta_description,
        published,
        published_at,
        category_id
      `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.warn("getArticleById ERROR:", error);
    return null;
  }

  return data || null;
}

/**
 * Viešas straipsnių sąrašas (/straipsniai)
 */
export async function getPublishedArticles() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        cover_image_url,
        body,
        published_at,
        category_id
      `
    )
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.warn("getPublishedArticles ERROR:", error);
    return [];
  }

  return data || [];
}

/**
 * Vienas straipsnis pagal slug'ą (viešam puslapiui /straipsniai/[slug])
 */
export async function getArticleBySlug(slug) {
  if (!slug) return null;

  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        body,
        cover_image_url,
        meta_title,
        meta_description,
        published,
        published_at,
        category_id
      `
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.warn("getArticleBySlug ERROR:", error);
    return null;
  }

  if (!data) return null;

  return data;
}
