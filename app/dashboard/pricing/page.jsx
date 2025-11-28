// app/dashboard/pricing/page.jsx

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { saveAdPricingSettings } from "@/lib/adPricingActions";

export const dynamic = "force-dynamic";

function hasError(err) {
  return !!(err && typeof err === "object" && Object.keys(err).length > 0);
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
    console.error("AdPricingSettings profile ERROR:", profileError);
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
      ? "Nepavyko išsaugoti kainų. Patikrink formą arba serverio logus."
      : null;

  const statusType =
    success === "1" ? "success" : error === "1" ? "error" : null;

  const homepageTopDefault =
    typeof settings?.homepage_top_price === "number"
      ? settings.homepage_top_price
      : 49;

  const homepageOtherDefault =
    typeof settings?.homepage_other_price === "number"
      ? settings.homepage_other_price
      : 39;

  const categoryPriceDefault =
    typeof settings?.category_price === "number"
      ? settings.category_price
      : 29;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Reklamos kainų nustatymai
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Čia nustatoma, kokia metinė kaina rodoma VIP zonoje ir
              teminėse kategorijose. Šie skaičiai naudojami ir naujų
              reklamų kainos pasiūlymui.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <a
              href="/dashboard/ads"
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
                VIP zonos TOP eilės kaina (6 slotai) – metinė kaina
              </label>
              <input
                id="homepageTopPrice"
                name="homepageTopPrice"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={homepageTopDefault}
                className="w-full max-w-[160px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
              <p className="text-[11px] text-gray-500">
                Ši kaina rodoma VIP zonos TOP eilėje (pirma eilė) – visiems 6
                slotams.
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="homepageOtherPrice"
                className="block text-sm font-medium text-gray-800"
              >
                VIP zonos kitų eilių kaina – metinė kaina
              </label>
              <input
                id="homepageOtherPrice"
                name="homepageOtherPrice"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={homepageOtherDefault}
                className="w-full max-w-[160px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
              <p className="text-[11px] text-gray-500">
                Ši kaina rodoma VIP zonoje visoms eilėms, išskyrus TOP
                (pirmą) eilę.
              </p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="categoryPrice"
                className="block text-sm font-medium text-gray-800"
              >
                Teminių kategorijų kaina – metinė kaina
              </label>
              <input
                id="categoryPrice"
                name="categoryPrice"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={categoryPriceDefault}
                className="w-full max-w-[160px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
              <p className="text-[11px] text-gray-500">
                Ši kaina rodoma visose teminėse kategorijose – visiems
                slotams.
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
