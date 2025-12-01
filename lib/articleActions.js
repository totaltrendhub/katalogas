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
    throw new Error("Neturi teisių atlikti šio veiksmo.");
  }

  return { user, supabase };
}

/**
 * Sugeneruoja unikalų slug:
 * - bazė: slugify(title) arba slugify(slug)
 * - jei užimtas: -2, -3, ... iki 50
 * - jei vis tiek kažkas keisto – prideda timestamp
 */
async function generateUniqueSlug(supabase, base, excludeId = null) {
  let baseSlug = slugify(base || "");
  if (!baseSlug) baseSlug = "straipsnis";

  let candidate = baseSlug;
  let suffix = 2;

  // bandome iki 50 kartų
  for (let i = 0; i < 50; i++) {
    const { data, error } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      // jei kažkoks keistas erroras – loginam ir grąžinam kandidatą
      console.error("generateUniqueSlug ERROR:", error);
      return candidate;
    }

    if (!data) {
      // nėra jokio straipsnio su tokiu slug – tinka
      return candidate;
    }

    if (excludeId && data.id === excludeId) {
      // tas pats straipsnis – galima palikti candidate
      return candidate;
    }

    // užimtas – einam prie kito
    candidate = `${baseSlug}-${suffix++}`;
  }

  // fallback – jeigu kažką labai keisto prisigeneravo
  return `${baseSlug}-${Date.now()}`;
}

/* -------------------- CREATE -------------------- */

export async function createArticleAction(formData) {
  const { user, supabase } = await ensureAdmin();

  const title = (formData.get("title") || "").toString().trim();
  let rawSlug = (formData.get("slug") || "").toString().trim();
  const categoryId = (formData.get("categoryId") || "").toString().trim();
  const coverImageUrl = (formData.get("coverImageUrl") || "").toString().trim();
  const body = (formData.get("body") || "").toString().trim();
  const publishNow = formData.get("publishNow") === "on";

  const metaTitle = (formData.get("metaTitle") || "").toString().trim();
  const metaDescription = (formData.get("metaDescription") || "")
    .toString()
    .trim();

  if (!title) {
    const debug = encodeURIComponent("MISSING_TITLE");
    redirect(`/dashboard/articles/new?error=article_failed&debug=${debug}`);
  }

  const baseSlug = rawSlug || title;
  const finalSlug = await generateUniqueSlug(supabase, baseSlug);

  const now = new Date();

  const payload = {
    title,
    slug: finalSlug,
    body, // ČIA – pilnas HTML iš TinyMCE
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
    const msg =
      error?.code === "23505"
        ? "DUPLICATE_SLUG"
        : `SUPABASE_INSERT_FAILED:${error?.message || error?.code || "unknown"}`;
    const debug = encodeURIComponent(msg);
    redirect(`/dashboard/articles/new?error=article_failed&debug=${debug}`);
  }

  // sėkmė
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
    const debug = encodeURIComponent("MISSING_ID");
    redirect(`/dashboard/articles?error=article_failed&debug=${debug}`);
  }

  const title = (formData.get("title") || "").toString().trim();
  let rawSlug = (formData.get("slug") || "").toString().trim();
  const categoryId = (formData.get("categoryId") || "").toString().trim();
  const coverImageUrl = (formData.get("coverImageUrl") || "").toString().trim();
  const body = (formData.get("body") || "").toString().trim();
  const publishNow = formData.get("publishNow") === "on";

  const metaTitle = (formData.get("metaTitle") || "").toString().trim();
  const metaDescription = (formData.get("metaDescription") || "")
    .toString()
    .trim();

  if (!title) {
    const debug = encodeURIComponent("MISSING_TITLE");
    redirect(
      `/dashboard/articles/${articleId}?error=article_failed&debug=${debug}`
    );
  }

  const baseSlug = rawSlug || title;
  const finalSlug = await generateUniqueSlug(supabase, baseSlug, articleId);

  const now = new Date();

  const updates = {
    title,
    slug: finalSlug,
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
    const msg =
      error?.code === "23505"
        ? "DUPLICATE_SLUG"
        : `SUPABASE_UPDATE_FAILED:${error?.message || error?.code || "unknown"}`;
    const debug = encodeURIComponent(msg);
    redirect(
      `/dashboard/articles/${articleId}?error=article_failed&debug=${debug}`
    );
  }

  revalidatePath("/straipsniai");
  revalidatePath(`/straipsniai/${finalSlug}`);
  revalidatePath("/dashboard/articles");

  redirect("/dashboard/articles?success=updated");
}

/* -------------------- DELETE -------------------- */

export async function deleteArticleAction(formData) {
  const { supabase } = await ensureAdmin();

  const articleId = (formData.get("articleId") || "").toString().trim();
  if (!articleId) {
    const debug = encodeURIComponent("MISSING_ID");
    redirect(`/dashboard/articles?error=article_failed&debug=${debug}`);
  }

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId);

  if (error) {
    console.error("deleteArticleAction delete ERROR:", error);
    const debug = encodeURIComponent(
      `SUPABASE_DELETE_FAILED:${error?.message || error?.code || "unknown"}`
    );
    redirect(`/dashboard/articles?error=article_failed&debug=${debug}`);
  }

  revalidatePath("/straipsniai");
  revalidatePath("/dashboard/articles");

  redirect("/dashboard/articles?success=deleted");
}
