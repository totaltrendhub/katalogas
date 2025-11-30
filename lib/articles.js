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
 * VISI straipsniai admino dashboard'ui.
 * Čia NEDAROM jokių joinų – tik paprasti stulpeliai iš `articles`.
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
      category_id
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("getAllArticlesWithCategory ERROR:", error);
    return [];
  }

  return data || [];
}

/**
 * Viešas PUBLlKUOTŲ straipsnių sąrašas /straipsniai
 * (čia irgi be jokių neegzistuojančių stulpelių, tik tai, kas tikrai yra DB)
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
 * Vienas straipsnis pagal ID (naudojama /dashboard/articles/[id])
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
 * Vienas straipsnis pagal SLUG'ą (viešam puslapiui /straipsniai/[slug])
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
    .maybeSingle();

  if (error) {
    console.warn("getArticleBySlug ERROR:", error);
    return null;
  }

  return data || null;
}
