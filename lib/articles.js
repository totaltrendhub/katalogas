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
    // čia užtenka warn, kad Next nerodytų raudono overlay
    console.warn("getArticleCategories ERROR:", error);
    return [];
  }

  return data || [];
}

/**
 * Visų straipsnių sąrašas admino dashboard'ui,
 * su pririšta kategorija.
 */
export async function getAllArticlesWithCategory() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        published,
        published_at,
        created_at,
        category_id,
        article_categories (
          id,
          name
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("getAllArticlesWithCategory ERROR:", error);
    return [];
  }

  const rows = data || [];

  // normalizuojam, kad būtų paprasčiau naudoti React'e
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    published: row.published,
    published_at: row.published_at,
    created_at: row.created_at,
    category_id: row.category_id,
    category: row.article_categories
      ? {
          id: row.article_categories.id,
          name: row.article_categories.name,
        }
      : null,
  }));
}

/**
 * Viešas straipsnių sąrašas (jei kažkada naudosi /straipsniai)
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
        excerpt,
        published_at
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
        body_html,
        cover_image_url,
        meta_title,
        meta_description,
        published,
        published_at,
        category_id,
        article_categories ( id, name )
      `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.warn("getArticleBySlug ERROR:", error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    category: data.article_categories
      ? {
          id: data.article_categories.id,
          name: data.article_categories.name,
        }
      : null,
  };
}
