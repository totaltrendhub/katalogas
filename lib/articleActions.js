// lib/articleActions.js
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-ąčęėįšųūž-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await supabaseServer();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("ensureAdmin profile ERROR:", error);
  }

  if (!profile?.is_admin) {
    // grąžinam į straipsnių dashboard'ą su klaida
    redirect("/dashboard/articles?error=not_admin");
  }

  return { user, supabase };
}

function compactError(err) {
  try {
    if (!err) return "unknown";
    if (typeof err === "string") return err.slice(0, 180);

    const code = err.code || err.status || err.statusCode || "";
    const msg = err.message || err.name || "";
    const compact = `${code}:${msg}` || JSON.stringify(err);
    return compact.slice(0, 180);
  } catch {
    return "unknown";
  }
}

/* -------------------- CREATE -------------------- */

export async function createArticleAction(formData) {
  const { user, supabase } = await ensureAdmin();

  const title = (formData.get("title") || "").toString().trim();
  let slug = (formData.get("slug") || "").toString().trim();
  const categoryId = (formData.get("categoryId") || "").toString().trim();
  const coverImageUrl = (formData.get("coverImageUrl") || "").toString().trim();
  const body = (formData.get("body") || "").toString().trim();
  const publishNow = formData.get("publishNow") === "on";

  const metaTitle = (formData.get("metaTitle") || "").toString().trim();
  const metaDescription = (formData.get("metaDescription") || "")
    .toString()
    .trim();

  if (!title) {
    const detail = encodeURIComponent("missing_title");
    redirect(
      `/dashboard/articles?error=create_failed&debug=${detail}`
    );
  }

  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  const now = new Date();

  const payload = {
    title,
    slug,
    body,
    cover_image_url: coverImageUrl || null,
    category_id: categoryId || null,
    published: publishNow,
    created_by: user.id,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    meta_title: metaTitle || null,
    meta_description: metaDescription || null,
  };

  if (publishNow) {
    payload.published_at = now.toISOString();
  }

  const { data, error } = await supabase
    .from("articles")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error || !data) {
    console.error("createArticleAction insert ERROR:", error);
    const detail = encodeURIComponent(compactError(error));
    redirect(
      `/dashboard/articles?error=create_failed&debug=${detail}`
    );
  }

  // sėkmingai
  revalidatePath("/straipsniai");
  revalidatePath(`/straipsniai/${data.slug}`);
  revalidatePath("/dashboard/articles");

  redirect("/dashboard/articles?success=created");
}

/* -------------------- UPDATE -------------------- */

export async function updateArticleAction(formData) {
  const { supabase } = await ensureAdmin();

  const articleId = (formData.get("articleId") || "").toString().trim();
  if (!articleId) {
    const detail = encodeURIComponent("missing_article_id");
    redirect(
      `/dashboard/articles?error=update_failed&debug=${detail}`
    );
  }

  const title = (formData.get("title") || "").toString().trim();
  let slug = (formData.get("slug") || "").toString().trim();
  const categoryId = (formData.get("categoryId") || "").toString().trim();
  const coverImageUrl = (formData.get("coverImageUrl") || "").toString().trim();
  const body = (formData.get("body") || "").toString().trim();
  const publishNow = formData.get("publishNow") === "on";

  const metaTitle = (formData.get("metaTitle") || "").toString().trim();
  const metaDescription = (formData.get("metaDescription") || "")
    .toString()
    .trim();

  if (!title) {
    const detail = encodeURIComponent("missing_title");
    redirect(
      `/dashboard/articles?error=update_failed&debug=${detail}`
    );
  }

  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  const now = new Date();

  const updates = {
    title,
    slug,
    body,
    cover_image_url: coverImageUrl || null,
    category_id: categoryId || null,
    updated_at: now.toISOString(),
    meta_title: metaTitle || null,
    meta_description: metaDescription || null,
  };

  if (publishNow) {
    updates.published = true;
    updates.published_at = now.toISOString();
  }

  const { error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", articleId);

  if (error) {
    console.error("updateArticleAction ERROR:", error);
    const detail = encodeURIComponent(compactError(error));
    redirect(
      `/dashboard/articles?error=update_failed&debug=${detail}`
    );
  }

  revalidatePath("/straipsniai");
  revalidatePath(`/straipsniai/${slug}`);
  revalidatePath("/dashboard/articles");

  redirect("/dashboard/articles?success=updated");
}

/* -------------------- DELETE -------------------- */

export async function deleteArticleAction(formData) {
  const { supabase } = await ensureAdmin();

  const articleId = (formData.get("articleId") || "").toString().trim();
  if (!articleId) {
    const detail = encodeURIComponent("missing_article_id");
    redirect(
      `/dashboard/articles?error=delete_failed&debug=${detail}`
    );
  }

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId);

  if (error) {
    console.error("deleteArticleAction delete ERROR:", error);
    const detail = encodeURIComponent(compactError(error));
    redirect(
      `/dashboard/articles?error=delete_failed&debug=${detail}`
    );
  }

  revalidatePath("/straipsniai");
  revalidatePath("/dashboard/articles");

  redirect("/dashboard/articles?success=deleted");
}
