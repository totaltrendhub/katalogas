// app/dashboard/articles/page.jsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { supabaseServer } from "@/lib/supabaseServer";
import {
  getAllArticlesWithCategory,
  getArticleCategories,
} from "@/lib/articles";

export const dynamic = "force-dynamic";

function hasError(err) {
  return !!(err && typeof err === "object" && Object.keys(err).length > 0);
}

export default async function ArticlesDashboardPage(props) {
  const searchParams = await props.searchParams;
  const success = searchParams?.success || null;
  const error = searchParams?.error || null;

  let statusMessage = null;
  let statusType = null; // "success" | "error"

  if (success === "created") {
    statusType = "success";
    statusMessage = "Straipsnis sėkmingai sukurtas.";
  } else if (success === "updated") {
    statusType = "success";
    statusMessage = "Straipsnis sėkmingai atnaujintas.";
  } else if (success === "deleted") {
    statusType = "success";
    statusMessage = "Straipsnis sėkmingai ištrintas.";
  } else if (error === "create_failed") {
    statusType = "error";
    statusMessage =
      "Straipsnio sukurti nepavyko. Patikrink formos duomenis ir bandyk dar kartą.";
  } else if (error === "update_failed") {
    statusType = "error";
    statusMessage =
      "Straipsnio atnaujinti nepavyko. Bandyk dar kartą arba patikrink serverio logus.";
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await supabaseServer();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (hasError(profileError)) {
    console.error("ArticlesDashboard profile ERROR:", profileError);
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-red-500">
        Neturi teisių matyti šio puslapio.
      </div>
    );
  }

  const [articles, categories] = await Promise.all([
    getAllArticlesWithCategory(),
    getArticleCategories(),
  ]);

  const catsById =
    categories?.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {}) || {};

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

      {/* status juosta */}
      {statusMessage && (
        <div
          className={
            "rounded-xl border px-4 py-2 text-sm " +
            (statusType === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-red-300 bg-red-50 text-red-800")
          }
        >
          {statusMessage}
        </div>
      )}

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
                const category = article.category_id
                  ? catsById[article.category_id]
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
                      {category?.name || "Be kategorijos"}
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
