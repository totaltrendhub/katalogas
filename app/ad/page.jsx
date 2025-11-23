// app/ad/[id]/page.jsx

import { supabaseServer } from "@/lib/supabaseServer";

export const metadata = {
  title: "Reklama – Reklamų Katalogas",
};

export default async function PublicAdPage({ params }) {
  const { id } = await params;

  const supabase = await supabaseServer();

  // 1. Pati reklama
  const { data: ad, error: adError } = await supabase
    .from("ads")
    .select("*")
    .eq("id", id)
    .single();

  if (adError || !ad) {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center text-red-500">
        Ši reklama nerasta arba nebegalioja.
      </div>
    );
  }

  // 2. Slot + kategorija – atskirais query (paprasčiau)
  let slot = null;
  let category = null;

  if (ad.slot_id) {
    const { data: slotData } = await supabase
      .from("slots")
      .select("*")
      .eq("id", ad.slot_id)
      .single();

    slot = slotData ?? null;

    if (slot?.category_id) {
      const { data: categoryData } = await supabase
        .from("categories")
        .select("*")
        .eq("id", slot.category_id)
        .single();

      category = categoryData ?? null;
    }
  }

  const isVip = category?.slug === "vip-zona";

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6">
      {/* Breadcrumb / info */}
      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
        <a href="/" className="hover:underline">
          Pradžia
        </a>
        <span>/</span>
        <span className="text-gray-400">Reklama</span>
        {category && (
          <>
            <span>/</span>
            <a href={`/${category.slug}`} className="hover:underline">
              {category.name}
            </a>
          </>
        )}
      </div>

      {/* Antraštė */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {ad.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          {category && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
              Kategorija:{" "}
              <span className="ml-1 font-medium">{category.name}</span>
            </span>
          )}

          {slot && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
              Eilė {slot.row_number}, vieta {slot.slot_number}
              {isVip && slot.row_number === 1 && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  VIP TOP
                </span>
              )}
            </span>
          )}

          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
            Trukmė: {ad.duration_months ?? 1} mėn.
          </span>
        </div>
      </header>

      {/* Pagrindinis blokas */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {/* Logotipas, jei yra */}
        {ad.image_url && (
          <div className="flex justify-center">
            <img
              src={ad.image_url}
              alt={ad.title}
              className="h-20 w-20 object-contain"
            />
          </div>
        )}

        {/* Nuoroda į svetainę */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Reklama nukreipia į šį puslapį:
          </p>
          <a
            href={ad.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Apsilankyti svetainėje
          </a>
          <div className="text-[11px] text-gray-400 mt-1 truncate max-w-full mx-auto">
            {ad.url}
          </div>
        </div>

        {/* Kaina / tipas */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
          <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1">
            Kaina:{" "}
            <span className="ml-1 font-semibold text-gray-900">
              {typeof ad.price === "number"
                ? ad.price.toFixed(2)
                : Number(ad.price || 0).toFixed(2)}{" "}
              €
            </span>
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1">
            Tipas:{" "}
            <span className="ml-1 font-semibold text-gray-900">
              {ad.is_animated ? "Animuota reklama" : "Statinė reklama"}
            </span>
          </span>
        </div>
      </section>
    </div>
  );
}
