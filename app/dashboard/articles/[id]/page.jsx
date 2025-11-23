// app/dashboard/articles/[id]/page.jsx

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { supabaseServer } from "@/lib/supabaseServer";
import { getArticleCategories, getArticleById } from "@/lib/articles";
import {
  updateArticleAction,
  deleteArticleAction,
} from "@/lib/articleActions";
import MarkdownEditor from "@/app/components/MarkdownEditor";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }) {
  const { id } = await params;

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

  if (error) console.error("EditArticle profile ERROR:", error);

  if (!profile?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-red-500">
        Neturi teisių matyti šio puslapio.
      </div>
    );
  }

  const [article, categories] = await Promise.all([
    getArticleById(id),
    getArticleCategories(),
  ]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-red-500">
        Straipsnis nerastas.
      </div>
    );
  }

  const publishedAt = article.published_at
    ? new Date(article.published_at)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Redaguoti straipsnį
        </h1>
        <p className="text-sm text-gray-600">
          Pavadinimas: {article.title}
        </p>
        {publishedAt && (
          <p className="text-xs text-gray-500">
            Publikuota:{" "}
            <span className="font-semibold">
              {publishedAt.toLocaleDateString("lt-LT")}
            </span>
          </p>
        )}
      </header>

      <form action={updateArticleAction} className="space-y-5">
        <input type="hidden" name="articleId" value={article.id} />

        <div className="space-y-1">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-800"
          >
            Pavadinimas
          </label>
          <input
            id="title"
            name="title"
            defaultValue={article.title || ""}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-800"
          >
            Slug (URL dalis)
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={article.slug || ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
          />
          <p className="text-[11px] text-gray-500">
            Jei pakeisi, pasikeis viešo puslapio URL.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-800"
            >
              Kategorija
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              defaultValue={article.category_id || ""}
            >
              <option value="">Be kategorijos</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="coverImageUrl"
              className="block text-sm font-medium text-gray-800"
            >
              Viršelio nuotrauka (URL)
            </label>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              defaultValue={article.cover_image_url || ""}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* SEO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="metaTitle"
              className="block text-sm font-medium text-gray-800"
            >
              Meta title
            </label>
            <input
              id="metaTitle"
              name="metaTitle"
              maxLength={70}
              defaultValue={article.meta_title || ""}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="metaDescription"
              className="block text-sm font-medium text-gray-800"
            >
              Meta description
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              rows={3}
              maxLength={180}
              defaultValue={article.meta_description || ""}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="body"
            className="block text-sm font-medium text-gray-800"
          >
            Straipsnio turinys
          </label>
          <MarkdownEditor name="body" defaultValue={article.body || ""} />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              name="publishNow"
              defaultChecked={!!article.published}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Pažymėti kaip publikuotą</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Išsaugoti pakeitimus
            </button>
          </div>
        </div>
      </form>

      <form
        action={deleteArticleAction}
        className="pt-4 border-t border-red-100"
      >
        <input type="hidden" name="articleId" value={article.id} />
        <button
          type="submit"
          className="text-xs text-red-600 hover:text-red-800"
        >
          Ištrinti straipsnį
        </button>
      </form>
    </div>
  );
}
