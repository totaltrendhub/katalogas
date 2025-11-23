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

// Sukurti naują straipsnį
export async function createArticleAction(formData) {
  try {
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
      console.error("createArticleAction: missing title");
      return;
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
      return;
    }

    revalidatePath("/straipsniai");
    revalidatePath(`/straipsniai/${data.slug}`);
    revalidatePath("/dashboard/articles");

    redirect("/dashboard/articles?success=created");
  } catch (err) {
    console.error("createArticleAction FATAL:", err);
  }
}

// Atnaujinti esamą straipsnį
export async function updateArticleAction(formData) {
  try {
    const { supabase } = await ensureAdmin();

    const articleId = (formData.get("articleId") || "").toString().trim();
    if (!articleId) {
      console.error("updateArticleAction: missing articleId");
      return;
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
      console.error("updateArticleAction: missing title");
      return;
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
      return;
    }

    revalidatePath("/straipsniai");
    revalidatePath(`/straipsniai/${slug}`);
    revalidatePath("/dashboard/articles");

    redirect("/dashboard/articles?success=updated");
  } catch (err) {
    console.error("updateArticleAction FATAL:", err);
  }
}

// Ištrinti straipsnį
export async function deleteArticleAction(formData) {
  try {
    const { supabase } = await ensureAdmin();

    const articleId = (formData.get("articleId") || "").toString().trim();
    if (!articleId) {
      console.error("deleteArticleAction: missing articleId");
      return;
    }

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", articleId);

    if (error) {
      console.error("deleteArticleAction delete ERROR:", error);
      return;
    }

    revalidatePath("/straipsniai");
    revalidatePath("/dashboard/articles");

    redirect("/dashboard/articles?success=deleted");
  } catch (err) {
    console.error("deleteArticleAction FATAL:", err);
  }
}
