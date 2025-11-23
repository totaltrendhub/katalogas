// app/dashboard/articles/page.jsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { supabaseServer } from "@/lib/supabaseServer";
import { getAllArticlesWithCategory } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function ArticlesDashboardPage() {
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
    console.error("ArticlesDashboard profile ERROR:", error);
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-red-500">
        Neturi teisių matyti šio puslapio.
      </div>
    );
  }

  const articles = await getAllArticlesWithCategory();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Straipsnių valdymas
          </h1>
          <p className="text-sm text-gray-600">
            Čia gali kurti, redaguoti ir publikuoti straipsnius SEO ir
            papildomai reklamai.
          </p>
        </div>
        <Link
          href="/dashboard/articles/new"
          className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Naujas straipsnis
        </Link>
      </header>

      {articles.length === 0 ? (
        <p className="text-sm text-gray-500">
          Kol kas nėra jokių straipsnių.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Pavadinimas
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Kategorija
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Statusas
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Publikuota
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">
                  Veiksmai
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const isPublished = !!article.published;
                const publishedAt = article.published_at
                  ? new Date(article.published_at)
                  : null;

                return (
                  <tr
                    key={article.id}
                    className="border-t border-gray-100"
                  >
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {article.title}
                      <div className="text-[11px] text-gray-400">
                        /straipsniai/{article.slug}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700">
                      {article.category_name || "Be kategorijos"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-[2px] text-[11px] font-semibold " +
                          (isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800")
                        }
                      >
                        {isPublished ? "Publikuotas" : "Juodraštis"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700">
                      {publishedAt
                        ? publishedAt.toLocaleDateString("lt-LT")
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-xs">
                      <div className="flex items-center justify-end gap-2">
                        {isPublished && (
                          <a
                            href={`/straipsniai/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-gray-500 hover:text-gray-800"
                          >
                            Peržiūrėti
                          </a>
                        )}
                        <Link
                          href={`/dashboard/articles/${article.id}`}
                          className="inline-flex items-center rounded-full border border-gray-200 px-2 py-[3px] text-[11px] font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          Redaguoti
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
