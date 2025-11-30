// app/dashboard/articles/new/page.jsx

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { supabaseServer } from "@/lib/supabaseServer";
import { getArticleCategories } from "@/lib/articles";
import { createArticleAction } from "@/lib/articleActions";
import RichTextEditor from "@/app/components/RichTextEditor";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
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

  if (error) console.error("NewArticle profile ERROR:", error);

  if (!profile?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-red-500">
        Neturi teisių matyti šio puslapio.
      </div>
    );
  }

  const categories = await getArticleCategories();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Naujas straipsnis
        </h1>
        <p className="text-sm text-gray-600">
          Užpildyk formą ir, jei pažymėsi, straipsnis iškart bus
          publikuotas.
        </p>
      </header>

      <form action={createArticleAction} className="space-y-5">
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
            placeholder="palik tuščią, jei generuoti iš pavadinimo"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
          />
          <p className="text-[11px] text-gray-500">
            Pavyzdžiui: &quot;mano-pirmas-straipsnis&quot;. Jei paliksi
            tuščią – sugeneruos automatiškai.
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
              defaultValue=""
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
              placeholder="nebūtina"
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
              placeholder="palik tuščią, jei naudoti pavadinimą"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-[11px] text-gray-500">
              Rekomenduojama iki ~60–70 simbolių.
            </p>
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
              placeholder="Trumpas aprašymas rezultatams paieškoje."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-[11px] text-gray-500">
              Rekomenduojama iki ~150–180 simbolių.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-800">
            Straipsnio turinys
          </label>
          <RichTextEditor name="body" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              name="publishNow"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Publikuoti iškart</span>
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Išsaugoti straipsnį
          </button>
        </div>
      </form>
    </div>
  );
}
