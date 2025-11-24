// app/dashboard/ads/page.jsx

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { createSlotAction } from "@/lib/slotActions";
import {
  isAdActive,
  getRemainingTimeInfo,
  formatVilniusDateTime,
  formatVilniusDate,
} from "@/lib/adUtils";

export const dynamic = "force-dynamic";

function toNumber(value) {
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function hasError(err) {
  return !!(
    err &&
    typeof err === "object" &&
    Object.keys(err).length > 0
  );
}

export default async function AdsDashboardPage(props) {
  const searchParams = await props.searchParams;
  const view = searchParams?.view || "slots";
  const activeSlug = searchParams?.category || null;

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
    console.error("AdsDashboard profile ERROR:", profileError);
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-red-500">
        Neturi teisių matyti šio puslapio.
      </div>
    );
  }

  // Kategorijos (naudojam abiejuose vaizduose)
  const { data: categoriesRaw, error: categoriesError } = await supabase
    .from("categories")
    .select("id,name,slug")
    .order("name", { ascending: true });

  if (hasError(categoriesError)) {
    console.error("AdsDashboard categories ERROR:", categoriesError);
  }

  const categories = categoriesRaw || [];
  const selectedCategory =
    categories.find((c) => c.slug === activeSlug) || categories[0] || null;

  const now = new Date();

  // Statuso juostos (success / error)
  const success = searchParams?.success || null;
  const error = searchParams?.error || null;

  let statusMessage = null;
  let statusType = null; // "success" | "error"

  if (success === "created") {
    statusType = "success";
    statusMessage = "Reklama sėkmingai sukurta.";
  } else if (success === "updated") {
    statusType = "success";
    statusMessage = "Reklama sėkmingai atnaujinta.";
  } else if (success === "deleted") {
    statusType = "success";
    statusMessage = "Reklama sėkmingai ištrinta.";
  } else if (error === "create_failed") {
    statusType = "error";
    statusMessage =
      "Nepavyko sukurti reklamos. Patikrink formos duomenis ir bandyk dar kartą.";
  } else if (error === "update_failed") {
    statusType = "error";
    statusMessage =
      "Nepavyko atnaujinti reklamos. Bandyk dar kartą arba patikrink serverio logus.";
  }

  // ------------------------------------------------------------------
  //  AKTYVIOS REKLAMOS VAIZDAS
  // ------------------------------------------------------------------
  if (view === "active") {
    const nowIso = now.toISOString();

    const { data: activeAdsRaw, error: activeAdsError } = await supabase
      .from("ads")
      .select(
        `
        id,
        title,
        url,
        price,
        duration_months,
        valid_until,
        created_at,
        slot:slots(
          id,
          row_number,
          slot_number,
          category:categories(
            id,
            name,
            slug
          )
        )
      `
      )
      .or(`valid_until.is.null,valid_until.gt.${nowIso}`);

    if (hasError(activeAdsError)) {
      console.error("AdsDashboard activeAds ERROR:", activeAdsError);
    }

    let activeAds = (activeAdsRaw || []).filter((ad) =>
      isAdActive(ad, now)
    );

    // Filtravimas pagal kategoriją (jei pasirinkta)
    const filterCategory =
      categories.find((c) => c.slug === activeSlug) || null;

    if (filterCategory) {
      activeAds = activeAds.filter(
        (ad) => ad.slot?.category?.id === filterCategory.id
      );
    }

    let totalActivePrice = 0;
    let totalActiveMonthly = 0;

    for (const ad of activeAds) {
      const p = toNumber(ad.price) ?? 0;
      const m = toNumber(ad.duration_months) ?? 1;
      totalActivePrice += p;
      totalActiveMonthly += m > 0 ? p / m : p;
    }

    // Statistikai – paskutiniai 12 mėn.
    const since = new Date(now.getTime());
    since.setMonth(since.getMonth() - 12);
    const sinceIso = since.toISOString();

    const { data: statsAds, error: statsError } = await supabase
      .from("ads")
      .select("id, price, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true });

    if (hasError(statsError)) {
      console.error("AdsDashboard statsAds ERROR:", statsError);
    }

    const monthlyMap = {};

    for (const ad of statsAds || []) {
      const d = new Date(ad.created_at);
      if (Number.isNaN(d.getTime())) continue;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;

      const price = toNumber(ad.price) ?? 0;

      if (!monthlyMap[key]) {
        monthlyMap[key] = { count: 0, sum: 0 };
      }
      monthlyMap[key].count += 1;
      monthlyMap[key].sum += price;
    }

    const monthlyStats = Object.entries(monthlyMap)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, value]) => ({ month, ...value }));

    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">Reklamos (admin)</h1>

            {/* Tab'ai */}
            <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-xs font-medium">
              <a
                href="/dashboard/ads?view=slots"
                className="rounded-full px-3 py-1 text-gray-600 hover:text-gray-900"
              >
                Slotai pagal kategoriją
              </a>
              <a
                href="/dashboard/ads?view=active"
                className="rounded-full px-3 py-1 bg-white shadow text-gray-900"
              >
                Aktyvios reklamos
              </a>
            </div>
          </div>

          {/* Statuso juosta */}
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

          {/* Filtras pagal kategoriją */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Aktyvios reklamos
                </h2>
                <p className="text-xs text-gray-500">
                  Visos reklamos, kurių galiojimas dar nepasibaigęs (pagal
                  Lietuvos laiką).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-500">
                  Filtruoti pagal kategoriją:
                </span>
                <a
                  href="/dashboard/ads?view=active"
                  className={
                    "rounded-full px-3 py-1 border " +
                    (!filterCategory
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400")
                  }
                >
                  Visos
                </a>
                {categories.map((cat) => {
                  const isActive = filterCategory?.id === cat.id;
                  return (
                    <a
                      key={cat.id}
                      href={`/dashboard/ads?view=active&category=${cat.slug}`}
                      className={
                        "rounded-full px-3 py-1 border " +
                        (isActive
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400")
                      }
                    >
                      {cat.name}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Santrauka */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <p className="text-xs text-gray-500 mb-1">
                  Aktyvių reklamų skaičius
                </p>
                <p className="text-2xl font-semibold">
                  {activeAds.length}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <p className="text-xs text-gray-500 mb-1">
                  Bendra aktyvių reklamų suma
                </p>
                <p className="text-xl font-semibold">
                  {totalActivePrice.toFixed(2)} €
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <p className="text-xs text-gray-500 mb-1">
                  Apytikslė mėnesinė suma
                </p>
                <p className="text-xl font-semibold">
                  {totalActiveMonthly.toFixed(2)} €/mėn.
                </p>
              </div>
            </div>
          </section>

          {/* Aktyvių reklamų sąrašas */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <th className="px-3 py-2">Pavadinimas</th>
                  <th className="px-3 py-2">Kategorija / slotas</th>
                  <th className="px-3 py-2">Kaina</th>
                  <th className="px-3 py-2">Galioja iki</th>
                  <th className="px-3 py-2">Liko</th>
                  <th className="px-3 py-2">Sukurta</th>
                </tr>
              </thead>
              <tbody>
                {activeAds.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-4 text-center text-xs text-gray-500"
                    >
                      Šiuo metu nėra aktyvių reklamų pagal pasirinktą
                      filtrą.
                    </td>
                  </tr>
                )}

                {activeAds.map((ad, idx) => {
                  const remaining = getRemainingTimeInfo(
                    ad.valid_until,
                    now
                  );
                  const nearExpiry =
                    remaining.totalDays !== null &&
                    remaining.totalDays <= 30 &&
                    remaining.totalDays >= 0;

                  return (
                    <tr
                      key={ad.id}
                      className={
                        "border-t border-gray-100 " +
                        (idx % 2 === 0 ? "bg-white" : "bg-gray-50/60")
                      }
                    >
                      <td className="px-3 py-2 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <a
                            href={`/ad/${ad.id}`}
                            target="_blank"
                            rel="noopener"
                            className="font-medium text-blue-700 hover:underline"
                          >
                            {ad.title || "(be pavadinimo)"}
                          </a>
                          <span className="text-[11px] text-gray-500 break-all">
                            {ad.url}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {ad.slot ? (
                          <div className="flex flex-col gap-0.5">
                            {ad.slot.category && (
                              <span className="text-[11px] text-gray-600">
                                {ad.slot.category.name}
                              </span>
                            )}
                            <span className="text-[11px] text-gray-500">
                              Eilė {ad.slot.row_number}, vieta{" "}
                              {ad.slot.slot_number}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">
                            Slotas nerastas
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        {toNumber(ad.price) != null ? (
                          <>
                            {toNumber(ad.price).toFixed(2)} €
                            {toNumber(ad.duration_months) ? (
                              <span className="text-[11px] text-gray-500">
                                {" "}
                                / {ad.duration_months} mėn. (
                                {(
                                  toNumber(ad.price) /
                                  toNumber(ad.duration_months)
                                ).toFixed(2)}{" "}
                                €/mėn.)
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <span className="text-gray-400">nenurodyta</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {ad.valid_until ? (
                          <span className="text-[11px] text-gray-700">
                            {formatVilniusDateTime(ad.valid_until)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">
                            nenurodyta
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {remaining.totalDays === null ? (
                          <span className="text-[11px] text-gray-400">
                            -
                          </span>
                        ) : remaining.totalDays < 0 ? (
                          <span className="text-[11px] text-red-600">
                            Pasibaigusi
                          </span>
                        ) : (
                          <span
                            className={
                              "inline-flex rounded-full px-2 py-[2px] text-[11px] " +
                              (nearExpiry
                                ? "bg-red-50 text-red-700 font-semibold"
                                : "bg-emerald-50 text-emerald-700")
                            }
                          >
                            Liko: {remaining.label}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {ad.created_at ? (
                          <span className="text-[11px] text-gray-600">
                            {formatVilniusDate(ad.created_at)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Mėnesinė statistika */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
              <h2 className="text-sm font-semibold text-gray-700">
                Paskutinių 12 mėn. statistika
              </h2>
              <p className="text-xs text-gray-500">
                Kiek reklamų buvo sukurta ir kokia bendra jų kaina
                kiekvieną mėnesį.
              </p>
            </div>

            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <th className="px-3 py-2">Mėnuo</th>
                  <th className="px-3 py-2">Reklamų sk.</th>
                  <th className="px-3 py-2">Bendra suma (€)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-4 text-center text-xs text-gray-500"
                    >
                      Paskutinius 12 mėn. nebuvo pridėta reklamų.
                    </td>
                  </tr>
                )}

                {monthlyStats.map((row) => (
                  <tr
                    key={row.month}
                    className="border-t border-gray-100 bg-white"
                  >
                    <td className="px-3 py-2 text-xs">{row.month}</td>
                    <td className="px-3 py-2 text-xs">{row.count}</td>
                    <td className="px-3 py-2 text-xs">
                      {row.sum.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    );
  }

  // ------------------------------------------------------------------
  //  SLOTŲ VAIZDAS (pagal kategoriją)
  // ------------------------------------------------------------------

  let slots = [];
  let adsById = {};

  if (selectedCategory) {
    const { data: slotsData, error: slotsError } = await supabase
      .from("slots")
      .select(
        "id,row_number,slot_number,price,duration_months,is_animated,ad_id"
      )
      .eq("category_id", selectedCategory.id)
      .order("row_number", { ascending: true })
      .order("slot_number", { ascending: true });

    if (hasError(slotsError)) {
      console.error("AdsDashboard slots ERROR:", slotsError);
    }

    slots = slotsData || [];

    const adIds = [
      ...new Set(slots.map((s) => s.ad_id).filter((id) => !!id)),
    ];

    if (adIds.length > 0) {
      const { data: adsData, error: adsError } = await supabase
        .from("ads")
        .select("id,title,url,valid_until,price,duration_months")
        .in("id", adIds);

      if (hasError(adsError)) {
        console.error("AdsDashboard ads ERROR:", adsError);
      } else if (adsData) {
        adsById = Object.fromEntries(adsData.map((ad) => [ad.id, ad]));
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold">Reklamos vietos (admin)</h1>

          {/* Tab'ai */}
          <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-xs font-medium">
            <a
              href="/dashboard/ads?view=slots"
              className="rounded-full px-3 py-1 bg-white shadow text-gray-900"
            >
              Slotai pagal kategoriją
            </a>
            <a
              href="/dashboard/ads?view=active"
              className="rounded-full px-3 py-1 text-gray-600 hover:text-gray-900"
            >
              Aktyvios reklamos
            </a>
          </div>
        </div>

        {/* Statuso juosta */}
        {statusMessage && (
          <div
            className={
              "mb-4 rounded-xl border px-4 py-2 text-sm " +
              (statusType === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-red-300 bg-red-50 text-red-800")
            }
          >
            {statusMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-6">
          {/* KATEGORIJŲ SĄRAŠAS */}
          <aside className="lg:pt-1">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Kategorijos
              </p>
              <nav className="mt-1 space-y-1 text-sm">
                {categories.map((cat) => {
                  const isActive = selectedCategory?.id === cat.id;
                  return (
                    <a
                      key={cat.id}
                      href={`/dashboard/ads?view=slots&category=${cat.slug}`}
                      className={
                        "flex items-center justify-between rounded-lg px-3 py-1.5 " +
                        (isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "hover:bg-gray-50 text-gray-800")
                      }
                    >
                      <span>{cat.name}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* SLOTŲ INFORMACIJA */}
          <section className="space-y-6">
            {selectedCategory ? (
              <>
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
                  <h2 className="text-lg font-semibold mb-1">
                    {selectedCategory.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Čia matosi visos šios kategorijos reklamos vietos:
                    užimti, pasibaigę ir laisvi slotai. Galiojimo data
                    rodoma pagal Lietuvos laiką.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        <th className="px-3 py-2">Eilė</th>
                        <th className="px-3 py-2">Vieta</th>
                        <th className="px-3 py-2">Statusas</th>
                        <th className="px-3 py-2">Tipas</th>
                        <th className="px-3 py-2">Kaina</th>
                        <th className="px-3 py-2">Galiojimas</th>
                        <th className="px-3 py-2">Veiksmai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-3 py-4 text-center text-xs text-gray-500"
                          >
                            Kol kas nėra nė vieno sloto šioje
                            kategorijoje.
                          </td>
                        </tr>
                      )}

                      {slots.map((slot, idx) => {
                        const ad = slot.ad_id
                          ? adsById[slot.ad_id] || null
                          : null;

                        const hasAd = !!ad;
                        const isTaken = isAdActive(ad, now);
                        const isExpired = hasAd && !isTaken;

                        const remaining = ad
                          ? getRemainingTimeInfo(ad.valid_until, now)
                          : null;

                        const nearExpiry =
                          isTaken &&
                          remaining &&
                          remaining.totalDays !== null &&
                          remaining.totalDays <= 30 &&
                          remaining.totalDays >= 0;

                        return (
                          <tr
                            key={slot.id}
                            className={
                              "border-t border-gray-100 " +
                              (idx % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50/60")
                            }
                          >
                            <td className="px-3 py-2 text-xs">
                              {slot.row_number}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {slot.slot_number}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isTaken ? (
                                <span
                                  className={
                                    "inline-flex items-center rounded-full px-2 py-[2px] text-[11px] font-semibold " +
                                    (nearExpiry
                                      ? "bg-red-50 text-red-700"
                                      : "bg-green-50 text-green-700")
                                  }
                                >
                                  Užimta – {ad.title}
                                </span>
                              ) : isExpired ? (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-[2px] text-[11px] font-semibold text-red-700">
                                  Reklama pasibaigusi
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-[2px] text-[11px] font-semibold text-yellow-700">
                                  Laisva vieta
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {slot.is_animated ? "Animuota" : "Statinė"}
                            </td>
                            <td className="px-3 py-2 text-xs whitespace-nowrap">
                              {slot.price != null ? (
                                <>
                                  {Number(slot.price).toFixed(2)} €{" "}
                                  <span className="text-gray-500">
                                    / {slot.duration_months || 12} mėn.
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-400">
                                  nenurodyta
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {hasAd ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[11px] text-gray-700">
                                    {ad.valid_until
                                      ? formatVilniusDateTime(
                                          ad.valid_until
                                        )
                                      : "Galiojimo data nenurodyta"}
                                  </span>
                                  {remaining &&
                                    remaining.totalDays !== null && (
                                      <span
                                        className={
                                          "text-[11px] " +
                                          (remaining.totalDays < 0
                                            ? "text-red-600 font-semibold"
                                            : nearExpiry
                                            ? "text-red-600 font-semibold"
                                            : "text-gray-600")
                                        }
                                      >
                                        {remaining.totalDays < 0
                                          ? "Pasibaigusi"
                                          : `Liko: ${remaining.label}`}
                                      </span>
                                    )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs space-x-2">
                              {isTaken && ad && (
                                <>
                                  <a
                                    href={`/ad/${ad.id}`}
                                    target="_blank"
                                    rel="noopener"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    Peržiūra
                                  </a>
                                  <a
                                    href={`/dashboard/ads/${ad.id}`}
                                    className="text-indigo-600 hover:text-indigo-800"
                                  >
                                    Redaguoti
                                  </a>
                                </>
                              )}

                              {!isTaken && (
                                <a
                                  href={`/buy/${slot.id}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Sukurti reklamą
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Naujo sloto forma */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm font-semibold mb-3">
                    Pridėti naują slotą šiai kategorijai
                  </h3>

                  <form
                    action={createSlotAction}
                    className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs"
                  >
                    <input
                      type="hidden"
                      name="categoryId"
                      value={selectedCategory.id}
                    />

                    <div className="space-y-1">
                      <label className="block text-[11px] text-gray-600">
                        Eilė
                      </label>
                      <input
                        name="rowNumber"
                        type="number"
                        min="1"
                        className="w-full rounded-lg border border-gray-300 px-2 py-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] text-gray-600">
                        Vieta
                      </label>
                      <input
                        name="slotNumber"
                        type="number"
                        min="1"
                        className="w-full rounded-lg border border-gray-300 px-2 py-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] text-gray-600">
                        Kaina (€)
                      </label>
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full rounded-lg border border-gray-300 px-2 py-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] text-gray-600">
                        Trukmė (mėn.)
                      </label>
                      <input
                        name="durationMonths"
                        type="number"
                        min="1"
                        className="w-full rounded-lg border border-gray-300 px-2 py-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] text-gray-600">
                        Tipas
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="isAnimated"
                          name="isAnimated"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="isAnimated"
                          className="text-[11px] text-gray-700"
                        >
                          Animuota reklama
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-3 lg:col-span-5 flex justify-end pt-1">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        Pridėti slotą
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 text-center text-sm text-gray-500">
                Nėra nė vienos kategorijos. Sukurk bent vieną kategorią
                „categories“ lentelėje.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
