// app/[slug]/page.jsx

import { redirect, notFound } from "next/navigation";
import { getSlotsByCategory } from "@/lib/getSlotsByCategory";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

/**
 * SEO tekstai pagal kategorijos slug.
 * Formuluotė: mes REKLAMUOJAME tokio tipo puslapius.
 */
const CATEGORY_SEO = {
  informacija: {
    h1: "Informacinių puslapių reklama",
    intro:
      "Šioje kategorijoje reklamuojami ir talpinami informaciniai tinklalapiai: katalogai, informacijos centrai, archyvai, paieškos sistemos, enciklopedijos, kalendoriai, parodų ir konferencijų projektai, orų prognozės, receptai ir TV programos.",
    metaDescription:
      "Informacinių puslapių reklama: katalogai, informacijos centrai, archyvai, enciklopedijos, orų prognozės ir TV programų svetainės. Ilgalaikė reklama internete su aiškia metine kaina.",
  },
  iniciatyvos: {
    h1: "Iniciatyvų puslapių reklama",
    intro:
      "Čia reklamuojami socialinių ir pilietinių iniciatyvų tinklalapiai: nevyriausybinės organizacijos, bendruomenių projektai, savanorystės platformos, paramos ir pagalbos iniciatyvos, kampanijos ir akcijos.",
    metaDescription:
      "Iniciatyvų puslapių reklama: NVO, bendruomenių projektai, savanorystės ir paramos iniciatyvų svetainės. Internetinė reklama, padedanti matytis geriems projektams.",
  },
  "kultura-menas": {
    h1: "Kultūros ir meno puslapių reklama",
    intro:
      "Šioje kategorijoje reklamuojami kultūros ir meno projektų tinklalapiai: teatrai, kino ir muzikos festivaliai, muziejai, galerijos, kultūros centrai, koncertų organizatoriai, kūrybinės dirbtuvės ir menininkų projektai.",
    metaDescription:
      "Kultūros ir meno puslapių reklama: teatrai, festivaliai, muziejai, galerijos ir kultūros centrų svetainės. Ilgalaikė internetinė reklama kultūros projektams.",
  },
  "nekilnojamas-turtas": {
    h1: "Nekilnojamo turto puslapių reklama",
    intro:
      "Čia talpinami ir reklamuojami nekilnojamo turto tematikos tinklalapiai: NT portalai, brokerių ir agentūrų svetainės, statybos projektai, nuomos ir pardavimo skelbimų puslapiai.",
    metaDescription:
      "Nekilnojamo turto puslapių reklama: NT portalai, brokerių ir agentūrų svetainės, statybos projektų ir skelbimų puslapiai. Reklama internete su aiškia metine kaina.",
  },
  parduotuves: {
    h1: "Internetinių parduotuvių reklama",
    intro:
      "Šioje kategorijoje reklamuojamos internetinės parduotuvės ir prekybos platformos: bendri e-komercijos portalai, nišinės e-parduotuvės, marketplace'ai ir kataloginiai parduotuvių puslapiai.",
    metaDescription:
      "Internetinių parduotuvių puslapių reklama: el. parduotuvės, prekybos portalai ir marketplace'ai. Ilgalaikė internetinė reklama pardavimams didinti.",
  },
  paslaugos: {
    h1: "Paslaugų puslapių reklama",
    intro:
      "Čia talpinami ir reklamuojami įvairių paslaugų tinklalapiai: teisinės ir finansinės paslaugos, buhalterija, marketingas, konsultacijos, meistrai ir remontas, švaros paslaugos, renginių organizatoriai ir kiti B2B / B2C paslaugų puslapiai.",
    metaDescription:
      "Paslaugų puslapių reklama: teisinės, finansinės, marketingo, remonto ir kitų paslaugų svetainės. Puslapių reklama su aiškia reklama internete kaina.",
  },
  pramogos: {
    h1: "Pramogų puslapių reklama",
    intro:
      "Šioje kategorijoje reklamuojami pramogų ir laisvalaikio tinklalapiai: renginių ir bilietų platformos, kino ir koncertų programos, atrakcionai, pramogų parkai bei laisvalaikio idėjų ir pasiūlymų portalai.",
    metaDescription:
      "Pramogų puslapių reklama: renginių, bilietų, pramogų parkų ir laisvalaikio idėjų svetainės. Interneto reklama aktyviai auditorijai.",
  },
  "seima-vaikai": {
    h1: "Šeimos ir vaikų puslapių reklama",
    intro:
      "Čia talpinami ir reklamuojami šeimos ir vaikų tematikos tinklalapiai: darželiai ir mokyklos, būreliai, edukaciniai projektai, tėvystės ir šeimos portalai, stovyklos bei užimtumo programos.",
    metaDescription:
      "Šeimos ir vaikų puslapių reklama: darželių, mokyklų, būrelių, stovyklų ir šeimos portalų svetainės. Internetinė reklama tikslinei auditorijai.",
  },
  "sportas-pomegiai": {
    h1: "Sporto ir pomėgių puslapių reklama",
    intro:
      "Šioje kategorijoje reklamuojami sporto ir pomėgių tinklalapiai: sporto klubai ir treneriai, sporto prekių parduotuvės, klubai ir būreliai, žvejybos, medžioklės, žaidimų ir kitų hobio sričių puslapiai.",
    metaDescription:
      "Sporto ir pomėgių puslapių reklama: sporto klubų, trenerių, hobio ir laisvalaikio projektų svetainės. Ilgalaikė reklama internetu aktyviems lankytojams.",
  },
  "sveikata-grozis": {
    h1: "Sveikatos ir grožio puslapių reklama",
    intro:
      "Čia talpinami ir reklamuojami sveikatos ir grožio tematikos tinklalapiai: klinikos, odontologai, medicinos centrai, grožio salonai, SPA, reabilitacijos ir sveikatinimo programų svetainės, mitybos ir savijautos projektai.",
    metaDescription:
      "Sveikatos ir grožio puslapių reklama: klinikų, odontologų, medicinos centrų, grožio salonų ir SPA svetainės. Ilgalaikė internetinė reklama su aiškia metine kaina.",
  },
  technologijos: {
    h1: "Technologijų puslapių reklama",
    intro:
      "Šioje kategorijoje reklamuojami technologijų ir IT projektų tinklalapiai: technologijų portalai, programinės įrangos projektai, SaaS sprendimai, hostingo ir serverių paslaugos, elektronikos ir IT įmonių svetainės.",
    metaDescription:
      "Technologijų puslapių reklama: IT, programinės įrangos, SaaS ir technologijų įmonių svetainės. Internetinė reklama skaitmeniniam verslui.",
  },
  transportas: {
    h1: "Transporto puslapių reklama",
    intro:
      "Čia talpinami ir reklamuojami transporto ir logistikos tinklalapiai: automobilių pardavimo ir nuomos svetainės, logistikos ir pervežimų įmonės, krovinių ir siuntų tarnybos, viešojo transporto projektai.",
    metaDescription:
      "Transporto puslapių reklama: automobilių, nuomos, logistikos ir pervežimų įmonių svetainės. Ilgalaikė reklama internete transporto sektoriui.",
  },
  "turizmas-keliones": {
    h1: "Turizmo ir kelionių puslapių reklama",
    intro:
      "Šioje kategorijoje reklamuojami turizmo ir kelionių tinklalapiai: kelionių agentūros, apgyvendinimo svetainės, gidai, lankytinų vietų portalai, stovyklos ir poilsio projektai.",
    metaDescription:
      "Turizmo ir kelionių puslapių reklama: kelionių agentūrų, apgyvendinimo, gidų ir lankytinų vietų svetainės. Interneto reklama keliautojų auditorijai.",
  },
  "verslas-finansai": {
    h1: "Verslo ir finansų puslapių reklama",
    intro:
      "Čia talpinami ir reklamuojami verslo ir finansų tematikos tinklalapiai: bankai ir kredito įstaigos, investavimo ir draudimo projektai, verslo konsultacijų puslapiai, B2B paslaugų platformos, verslo naujienų portalai.",
    metaDescription:
      "Verslo ir finansų puslapių reklama: bankų, finansų, investavimo ir verslo naujienų svetainės. Internetinė reklama su aiškia metine kaina.",
  },
  ziniasklaida: {
    h1: "Žiniasklaidos puslapių reklama",
    intro:
      "Šioje kategorijoje reklamuojami žiniasklaidos ir turinio projektų tinklalapiai: naujienų portalai, internetiniai žurnalai, tinklaraščiai, podcastų ir vaizdo turinio platformos.",
    metaDescription:
      "Žiniasklaidos puslapių reklama: naujienų portalai, žurnalai, tinklaraščiai ir turinio platformos. Ilgalaikė internetinė reklama su stabilia pozicija kataloge.",
  },
};

function buildFallbackSeo(categoryName) {
  const base = categoryName || "Teminių";
  return {
    h1: `${base} puslapių reklama`,
    intro:
      "Šioje kategorijoje talpinami ir reklamuojami teminiai tinklalapiai. Ilgalaikė internetinė reklama su aiškia metine kaina ir pastovia pozicija kataloge.",
    metaDescription:
      "Teminių puslapių reklama: ilgalaikė reklama internete su aiškia metine kaina. Internetinė reklama nišiniuose tinklalapiuose.",
  };
}

/* ---------- META: title + description ---------- */

export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (slug === "vip-zona") {
    return {
      title: "Internetinė reklama – VIP zona",
      description:
        "Internetinė reklama VIP zonoje: aukščiausios eilės reklamos vietos su didžiausiu matomumu ir aiškia metine kaina.",
      alternates: {
        canonical: "/",
      },
    };
  }

  const { category } = await getSlotsByCategory(slug);

  if (!category) {
    return {
      title: "Kategorija nerasta",
      description: "Ieškoma reklamos kategorija nerasta.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cfg = CATEGORY_SEO[slug] || buildFallbackSeo(category.name);

  return {
    title: cfg.h1,
    description: cfg.metaDescription,
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

/* ------------------- Puslapis ------------------- */

const CATEGORY_ANNUAL_PRICE = 29;

// Čia – tas pats helperis kaip homepage, kad visur būtų 6 slotai eilėje
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

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  if (slug === "vip-zona") {
    redirect("/");
  }

  const { category, slots } = await getSlotsByCategory(slug);

  if (!category) {
    notFound();
  }

  const seoCfg = CATEGORY_SEO[slug] || buildFallbackSeo(category.name);

  // Kategorijos sidebarui
  const supabase = await supabaseServer();
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (categoriesError) {
    console.error("CategoryPage categories ERROR:", categoriesError);
  }

  const allCategories = categories || [];
  const vipCategory =
    allCategories.find((c) => c.slug === "vip-zona") || null;
  const otherCategories = allCategories
    .filter((c) => c.slug !== "vip-zona")
    .sort((a, b) => a.name.localeCompare(b.name, "lt-LT"));

  // Grupavimas pagal eilę – identiškai kaip homepage
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
        {/* Hero – centrinis, kaip VIP, tik su SEO tekstais */}
        <section className="mt-10 mb-8 text-center">
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
            {seoCfg.h1}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm text-gray-600">
            {seoCfg.intro}
          </p>
        </section>

        {/* Layout identiškas VIP zonai */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr),minmax(0,1fr)] gap-8 items-start">
          {/* Kairė – slotų gridas */}
          <div>
            {/* TOP eilė */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">TOP eilė</h2>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {topRow.map((slot) => (
                  <CategorySlotCard
                    key={slot.id}
                    slot={slot}
                    isTopRow
                  />
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
                        <CategorySlotCard key={slot.id} slot={slot} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          {/* Dešinė – teminės kategorijos + tas pats „Kaip rezervuoti“ blokas */}
          <aside className="lg:pt-2 lg:sticky lg:top-6 space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Teminės kategorijos
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  Pasirinkite kategoriją ir peržiūrėkite joje esančias
                  reklamos vietas.
                </p>
              </div>

              {vipCategory && (
                <a
                  href="/"
                  className="mt-2 flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50 transition"
                >
                  <span>VIP zona</span>
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-[2px] text-[11px] font-bold text-white">
                    VIP
                  </span>
                </a>
              )}

              <div className="border-t border-gray-100 pt-3 mt-2 space-y-1">
                {otherCategories.map((cat) => {
                  const isActive = cat.slug === slug;
                  return (
                    <a
                      key={cat.id}
                      href={`/${cat.slug}`}
                      className={
                        "block rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50 " +
                        (isActive
                          ? "font-semibold text-blue-700"
                          : "text-gray-800")
                      }
                    >
                      {cat.name}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* toks pats blokas kaip homepage */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Kaip rezervuoti vietą reklamai?
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

function CategorySlotCard({ slot, isTopRow = false }) {
  const ad = slot.ad || null;
  const isTaken = !!ad;

  const label = isTopRow ? "TOP VIETA" : `VIETA ${slot.slot_number}`;
  const annualPrice = CATEGORY_ANNUAL_PRICE;
  const anchorText = ad?.anchor_text || ad?.title || "";

  const baseClasses =
    "rounded-2xl border px-2 py-2 text-[11px] bg-white shadow-sm w-[135px] h-[135px] mx-auto overflow-hidden " +
    (isTopRow
      ? "border-amber-200 bg-gradient-to-b from-amber-50 to-white"
      : "border-gray-200");

  return (
    <div className={baseClasses}>
      <div className="flex flex-col h-full">
        {/* Label tik laisvam slotui */}
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

        <div className="mt-1 text-[10px] font-semibold text-center leading-tight">
          {isTaken ? (
            <a
              href={ad.url}
              target="_blank"
              rel="noopener"
              className="block w-full text-blue-700 hover:text-blue-900 leading-tight line-clamp-2"
            >
              {anchorText}
            </a>
          ) : (
            <span className="text-gray-700">
              {annualPrice.toFixed(2)} €{" "}
              <span className="text-gray-500 font-normal">/ metai</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
