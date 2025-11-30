// app/straipsniai/[slug]/page.jsx

import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getArticleBySlug, getArticleCategories } from "@/lib/articles";

export const dynamic = "force-dynamic";

// SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const supabase = await supabaseServer();
  const { data: article, error } = await supabase
    .from("articles")
    .select("title, meta_title, meta_description, body_html, body, published")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !article) {
    return {
      title: "Straipsnis nerastas - Reklamų katalogas",
    };
  }

  const title = article.meta_title || article.title;

  const rawHtml = article.body_html || article.body || "";
  const plain = rawHtml.replace(/<[^>]+>/g, "").slice(0, 160);
  const description = article.meta_description || plain;

  return { title, description };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;

  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const categories = await getArticleCategories();
  const category = article.category_id
    ? categories.find((c) => c.id === article.category_id)
    : null;

  const publishedAt = article.published_at
    ? new Date(article.published_at)
    : null;

  const htmlBody = article.body_html || article.body || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Straipsnis
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            {category && (
              <span className="inline-flex rounded-full bg-blue-50 px-2 py-[2px] text-[11px] font-semibold text-blue-700">
                {category.name}
              </span>
            )}
            {publishedAt && (
              <span>
                Publikuota:{" "}
                <span className="font-semibold">
                  {publishedAt.toLocaleDateString("lt-LT")}
                </span>
              </span>
            )}
          </div>
        </header>

        {/* Viršelio paveikslėlis */}
        {article.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full max-h-80 rounded-2xl object-cover border border-gray-200"
          />
        )}

        {/* Straipsnio turinys */}
        <article className="article-body text-gray-800">
          <div
            dangerouslySetInnerHTML={{ __html: htmlBody }}
          />
        </article>
      </main>
    </div>
  );
}
