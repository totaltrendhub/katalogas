// app/dashboard/page.jsx

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { isAdActive } from "@/lib/adUtils";

export const dynamic = "force-dynamic";

function toNumber(value) {
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default async function DashboardHomePage() {
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

  if (profileError) {
    console.error("DashboardHome profile ERROR:", profileError);
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-red-500">
        Neturi teisių matyti šio puslapio.
      </div>
    );
  }

  const now = new Date();

  // Visi ads (tik tam, kad pačiam suskaičiuotume aktyvias)
  const { data: ads, error: adsError } = await supabase
    .from("ads")
    .select("id, price, duration_months, valid_until");

  if (adsError) {
    console.error("DashboardHome ads ERROR:", adsError);
  }

  const allAds = ads || [];
  const activeAds = allAds.filter((ad) => isAdActive(ad, now));
  const activeAdsCount = activeAds.length;

  let totalActivePrice = 0;
  let totalActiveMonthly = 0;

  for (const ad of activeAds) {
    const p = toNumber(ad.price) ?? 0;
    const m = toNumber(ad.duration_months) ?? 1;
    totalActivePrice += p;
    totalActiveMonthly += m > 0 ? p / m : p;
  }

  // Slotų kiekis
  const { count: totalSlots, error: slotsError } = await supabase
    .from("slots")
    .select("*", { count: "exact", head: true });

  if (slotsError) {
    console.error("DashboardHome slots ERROR:", slotsError);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col gap-1 mb-2">
          <h1 className="text-2xl font-bold">Admino valdymo skydelis</h1>
          <p className="text-xs text-gray-500">
            Prisijungęs: {user.email || "admin"}
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Suvestinė
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Aktyvios reklamos */}
            <a
              href="/dashboard/ads?view=active"
              className="block rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 hover:border-blue-400 hover:bg-blue-50/40 transition"
            >
              <p className="text-xs text-gray-500 mb-1">
                Aktyvios reklamos
              </p>
              <p className="text-3xl font-semibold text-gray-900">
                {activeAdsCount}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Spausk, kad pamatytum visą aktyvių reklamų sąrašą.
              </p>
            </a>

            {/* Visi slotai */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">
                Visos vietos (slotai)
              </p>
              <p className="text-3xl font-semibold text-gray-900">
                {totalSlots ?? 0}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Visi sukurti slotai visose kategorijose.
              </p>
            </div>

            {/* Greita nuoroda į reklamas */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 flex flex-col justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Greita nuoroda
                </p>
                <p className="text-sm font-medium text-gray-800 mb-2">
                  Reklamų valdymas
                </p>
              </div>
              <div>
                <a
                  href="/dashboard/ads"
                  className="inline-flex items-center rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition"
                >
                  Valdyti reklamas
                </a>
              </div>
            </div>
          </div>

          {/* Mini apžvalga apie pajamas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 mt-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Bendra aktyvių reklamų suma
              </p>
              <p className="text-xl font-semibold">
                {totalActivePrice.toFixed(2)} €
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Visų šiuo metu aktyvių reklamų kaina už visą laikotarpį.
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Apytikslė mėnesinė suma
              </p>
              <p className="text-xl font-semibold">
                {totalActiveMonthly.toFixed(2)} €/mėn.
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Skaičiuojama kaip price / duration_months, sudėta per
                visas aktyvias reklamas.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
