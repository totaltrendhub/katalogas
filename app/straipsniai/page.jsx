// app/straipsniai/page.jsx

import Link from "next/link";
import { getPublishedArticles, getArticleCategories } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const [articles, categories] = await Promise.all([
    getPublishedArticles(),
    getArticleCategories(),
  ]);

  const catsById =
    categories?.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {}) || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Straipsniai
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Straipsniai ir įžvalgos
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Turinys SEO, rinkodarai ir papildomai reklamai. Naudojamas
            pritraukti papildomą srautą į katalogą.
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">
            Dar nėra publikuotų straipsnių.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {articles.map((article) => {
              const category = article.category_id
                ? catsById[article.category_id]
                : null;
              const publishedAt = article.published_at
                ? new Date(article.published_at)
                : null;

              const excerpt =
                (article.body || "").length > 180
                  ? article.body.slice(0, 180) + "..."
                  : article.body || "";

              return (
                <Link
                  key={article.id}
                  href={`/straipsniai/${article.slug}`}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {article.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      className="h-40 w-full object-cover"
                    />
                  )}

                  <div className="flex flex-1 flex-col px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {category && (
                        <span className="inline-flex rounded-full bg-blue-50 px-2 py-[2px] text-[11px] font-semibold text-blue-700">
                          {category.name}
                        </span>
                      )}
                      {publishedAt && (
                        <span className="text-[11px] text-gray-500">
                          {publishedAt.toLocaleDateString("lt-LT")}
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {article.title}
                    </h2>

                    <p className="text-xs text-gray-600 line-clamp-3">
                      {excerpt}
                    </p>

                    <div className="pt-2 mt-auto text-xs font-semibold text-blue-700">
                      Skaityti daugiau →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
