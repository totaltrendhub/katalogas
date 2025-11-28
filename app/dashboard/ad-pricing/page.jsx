// app/dashboard/ad-pricing/page.jsx

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";

export const dynamic = "force-dynamic";

function hasError(err) {
  return !!(err && typeof err === "object" && Object.keys(err).length > 0);
}

// SERVER ACTION – išsaugoti kainų nustatymus
async function saveAdPricingSettings(formData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await supabaseServer();

  // admin check
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (hasError(profileError)) {
    console.error("saveAdPricingSettings profile ERROR:", profileError);
    redirect("/dashboard/ad-pricing?error=1");
  }

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  const id = (formData.get("id") || "").toString().trim() || null;

  const homepageTopPriceRaw = (formData.get("homepageTopPrice") || "")
    .toString()
    .trim();
  const homepageOtherPriceRaw = (
    formData.get("homepageOtherPrice") || ""
  )
    .toString()
    .trim();
  const categoryPriceRaw = (formData.get("categoryPrice") || "")
    .toString()
    .trim();

  const homepageTopPrice = Number(homepageTopPriceRaw);
  const homepageOtherPrice = Number(homepageOtherPriceRaw);
  const categoryPrice = Number(categoryPriceRaw);

  const safeTop =
    Number.isFinite(homepageTopPrice) && homepageTopPrice >= 0
      ? homepageTopPrice
      : 24.99;

  const safeOther =
    Number.isFinite(homepageOtherPrice) && homepageOtherPrice >= 0
      ? homepageOtherPrice
      : 19.99;

  const safeCategory =
    Number.isFinite(categoryPrice) && categoryPrice >= 0
      ? categoryPrice
      : 14.99;

  const payload = {
    homepage_top_price: safeTop,
    homepage_other_price: safeOther,
    category_price: safeCategory,
  };

  let upsertData = payload;
  if (id) {
    upsertData = { id, ...payload };
  }

  const { error: upsertError } = await supabase
    .from("ad_pricing_settings")
    .upsert(upsertData, { onConflict: "id" });

  if (hasError(upsertError)) {
    console.error("saveAdPricingSettings UPSERT ERROR:", upsertError);
    redirect("/dashboard/ad-pricing?error=1");
  }

  revalidatePath("/");
  revalidatePath("/vip-zona");
  revalidatePath("/dashboard/ads");
  // visos kategorijos irgi per tą helperį naudoja kainą
  revalidatePath("/[slug]");

  redirect("/dashboard/ad-pricing?success=1");
}

export default async function AdPricingSettingsPage(props) {
  const searchParams = await props.searchParams;
  const success = searchParams?.success || null;
  const error = searchParams?.error || null;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await supabaseServer();

  // admin check
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (hasError(profileError)) {
    console.error("AdPricing profile ERROR:", profileError);
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-3xl mx-auto px-4 py-10 text-center text-red-500">
          Neturi teisių matyti šio puslapio.
        </main>
      </div>
    );
  }

  // paimam vieną nustatymų įrašą (singleton)
  const { data: settings, error: settingsError } = await supabase
    .from("ad_pricing_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (hasError(settingsError)) {
    console.error("AdPricingSettings fetch ERROR:", settingsError);
  }

  const statusMessage =
    success === "1"
      ? "Reklamos kainos sėkmingai išsaugotos."
      : error === "1"
      ? "Nepavyko išsaugoti kainų nustatymų. Patikrink formą arba serverio logus."
      : null;

  const statusType =
    success === "1" ? "success" : error === "1" ? "error" : null;

  const defaultTop =
    typeof settings?.homepage_top_price === "number"
      ? settings.homepage_top_price
      : 24.99;

  const defaultOther =
    typeof settings?.homepage_other_price === "number"
      ? settings.homepage_other_price
      : 19.99;

  const defaultCategory =
    typeof settings?.category_price === "number"
      ? settings.category_price
      : 14.99;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Reklamos kainų nustatymai
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Čia nustatai metines reklamos kainas: VIP zonos TOP eilės,
              likusių eilių ir visų teminių kategorijų.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <a
              href="/dashboard/ads?view=slots"
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              ← Grįžti į reklamas
            </a>
          </div>
        </header>

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

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-5">
          <form action={saveAdPricingSettings} className="space-y-5">
            {settings?.id && (
              <input type="hidden" name="id" value={settings.id} />
            )}

            <div className="space-y-1">
              <label
                htmlFor="homepageTopPrice"
                className="block text-sm font-medium text-gray-800"
              >
                Homepage TOP eilės (1 eilė) kaina / metai (€)
              </label>
              <input
                id="homepageTopPrice"
                name="homepageTopPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={defaultTop}
                className="w-full max-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
              <p className="text-[11px] text-gray-500">
                Ši kaina taikoma visiems 1-os eilės slotams VIP zonoje
                (homepage).
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="homepageOtherPrice"
                className="block text-sm font-medium text-gray-800"
              >
                Homepage kitų eilių kaina / metai (€)
              </label>
              <input
                id="homepageOtherPrice"
                name="homepageOtherPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={defaultOther}
                className="w-full max-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
              <p className="text-[11px] text-gray-500">
                Ši kaina taikoma 2, 3 ir kitoms eilėms VIP zonoje
                (homepage).
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="categoryPrice"
                className="block text-sm font-medium text-gray-800"
              >
                Visų teminių kategorijų kaina / metai (€)
              </label>
              <input
                id="categoryPrice"
                name="categoryPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={defaultCategory}
                className="w-full max-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
              <p className="text-[11px] text-gray-500">
                Ši kaina taikoma visiems slotams teminių kategorijų
                puslapiuose.
              </p>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Išsaugoti kainas
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
