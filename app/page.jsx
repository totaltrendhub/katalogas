// app/page.jsx

import { getSlotsByCategoryPublic } from "@/lib/getSlotsByCategoryPublic";
import { supabasePublic } from "@/lib/supabasePublic";

// Homepage darom statinį su ISR – Vercel gali cache'inti rezultatą
export const revalidate = 600; // 10 min (gali keisti vėliau)

const ROW_ANNUAL_PRICES = {
  1: 49,
  2: 39,
  3: 39,
  4: 39,
  5: 39,
  6: 39,
  7: 39,
  8: 39,
};

function getAnnualPrice(rowNumber) {
  const n = Number(rowNumber);
  return ROW_ANNUAL_PRICES[n] ?? null;
}

// Sukuriam 1–6 slotus eilėje, trūkstamus užpildom virtualiais
function buildDisplaySlots(rowSlots, rowNumber, maxSlots = 6) {
  const bySlotNumber = new Map();
  for (const slot of rowSlots || []) {
    const num = Number(slot.slot_number) || 0;
    if (num > 0 && num <= maxSlots) {
      bySlotNumber.set(num, slot);
    }
  }

  const result = [];
  for (let pos = 1; pos <= maxSlots; pos++) {
    const existing = bySlotNumber.get(pos);
    if (existing) {
      result.push(existing);
    } else {
      result.push({
        id: `virtual-${rowNumber}-${pos}`,
        row_number: rowNumber,
        slot_number: pos,
        ad: null,
      });
    }
  }
  return result;
}

export default async function HomePage() {
  // VIP zonos slotai (su reklamos objektais, jei aktyvūs)
  const { category, slots } = await getSlotsByCategoryPublic("vip-zona");

  // Visos kategorijos sidebarui – irgi per public klientą
  const supabase = supabasePublic;
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (categoriesError) {
    console.warn("HomePage categories ERROR:", categoriesError);
  }

  const allCategories = categoriesData || [];
  const vipCategory =
    allCategories.find((c) => c.slug === "vip-zona") || null;
  const otherCategories = allCategories
    .filter((c) => c.slug !== "vip-zona")
    .sort((a, b) => a.name.localeCompare(b.name, "lt"));

  // Grupavimas pagal eilę
  const rows = (slots || []).reduce((acc, slot) => {
    const key = slot.row_number || 1;
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {});

  Object.values(rows).forEach((row) =>
    row.sort((a, b) => (a.slot_number || 0) - (b.slot_number || 0))
  );

  const topRowRaw = rows[1] || [];
  const topRow = buildDisplaySlots(topRowRaw, 1, 6);

  const otherRows = Object.entries(rows)
    .filter(([rowNumber]) => Number(rowNumber) !== 1)
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 pb-12">
        {/* Hero */}
        <section className="mt-10 mb-8 text-center">
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
            VIP reklamos zona
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm text-gray-600">
            Išskirtinės reklamos vietos su didžiausia ekspozicija.
          </p>
        </section>

        {/* Layout: slotai + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr),minmax(0,1fr)] gap-8 items-start">
          {/* Kairė – slotai */}
          <div>
            {/* TOP eilė */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">TOP eilė</h2>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {topRow.map((slot) => (
                  <HomeSlotCard key={slot.id} slot={slot} isTopRow />
                ))}
              </div>
            </section>

            {/* Kitos eilės */}
            <section className="mt-8 space-y-6">
              {otherRows.map(([rowNumber, rowSlots]) => {
                const displaySlots = buildDisplaySlots(
                  rowSlots,
                  Number(rowNumber),
                  6
                );

                return (
                  <div key={rowNumber} className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Eilė {rowNumber}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      {displaySlots.map((slot) => (
                        <HomeSlotCard key={slot.id} slot={slot} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          {/* Dešinė – kategorijos + instrukcija */}
          <aside className="lg:pt-2 lg:top-6 lg:sticky space-y-4">
            {/* Teminės kategorijos */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
              <div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Pasirinkite kategoriją ir peržiūrėkite joje esančias
                  reklamos vietas.
                </p>
              </div>

              {vipCategory && (
                <a
                  href="/vip-zona"
                  className="mt-2 flex items-center justify-between rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100 transition"
                >
                  <span>VIP zona</span>
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-[2px] text-[11px] font-bold text-white">
                    VIP
                  </span>
                </a>
              )}

              <div className="border-t border-gray-100 pt-3 mt-2 space-y-1">
                {otherCategories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="block rounded-lg px-2 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Kaip rezervuoti reklamą? */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Kaip rezervuoti reklamą?
                </p>
                <p className="mt-1 text-[11px] text-gray-600">
                  Išsirinkite laisvą vietą ir susisiekite – viską sutvarkysime
                  rankiniu būdu.
                </p>
              </div>

              <ul className="mt-1 space-y-1 text-[11px] text-gray-600">
                <li>• Pasirenkate kategoriją ir laisvą vietą.</li>
                <li>
                  • Atsiunčiate mums savo puslapio pavadinimą, logotipą ir
                  nuorodą.
                </li>
                <li>
                  • Suderiname laikotarpį ir sąlygas, patalpiname reklamą.
                </li>
              </ul>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] font-semibold text-gray-800">
                  Kontaktai:
                </p>
                <p className="mt-1 text-[11px] text-gray-700">
                  Tel.: +370 689 784 33
                </p>
                <p className="text-[11px] text-gray-700">
                  El. paštas:{" "}
                  <a
                    href="mailto:info@elektroninesvizijos.lt"
                    className="text-blue-700 hover:text-blue-900 font-medium"
                  >
                    info@elektroninesvizijos.lt
                  </a>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function HomeSlotCard({ slot, isTopRow = false }) {
  const ad = slot.ad || null;
  const isTaken = !!ad;

  const label = isTopRow ? "TOP VIETA" : `VIETA ${slot.slot_number}`;
  const annualPrice = getAnnualPrice(slot.row_number);
  const anchorText = ad?.anchor_text || ad?.title || "";
  const isLongAnchor = anchorText.length > 22;

  const baseClasses =
    "group rounded-2xl border px-2 py-2 text-[11px] bg-white shadow-sm w-[135px] h-[135px] mx-auto overflow-hidden transition-colors " +
    (isTopRow
      ? "border-amber-200 bg-gradient-to-b from-amber-50 to-white hover:border-amber-300"
      : "border-gray-200 hover:border-gray-300");

  const content = (
    <div className="flex flex-col h-full">
      {!isTaken && (
        <div className="text-[9px] font-semibold uppercase tracking-wide text-amber-500 mb-[2px]">
          {label}
        </div>
      )}

      <div
        className={
          "flex-1 flex justify-center " +
          (isTaken ? "items-start" : "items-center")
        }
      >
        {isTaken ? (
          ad.image_url ? (
            <div className="w-[120px] max-w-full max-h-[80px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.image_url}
                alt={anchorText || ad.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : null
        ) : (
          <div className="text-[12px] font-semibold text-gray-900">
            LAISVA
          </div>
        )}
      </div>

      <div className="mt-1 text-center leading-tight">
        {isTaken ? (
          anchorText ? (
            <span
              className={
                "block w-full font-semibold text-blue-700 group-hover:text-blue-900 overflow-hidden text-ellipsis whitespace-nowrap " +
                (isLongAnchor ? "text-[10px]" : "text-[12px]")
              }
              title={anchorText}
            >
              {anchorText}
            </span>
          ) : null
        ) : annualPrice ? (
          <span className="text-[11px] text-gray-700">
            {annualPrice.toFixed(2)} €{" "}
            <span className="text-gray-500 font-normal">/ metai</span>
          </span>
        ) : (
          <span className="text-[11px] text-gray-400">
            Kaina pagal susitarimą
          </span>
        )}
      </div>
    </div>
  );

  if (isTaken && ad?.url) {
    return (
      <a
        href={ad.url}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        title={anchorText}
      >
        {content}
      </a>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
