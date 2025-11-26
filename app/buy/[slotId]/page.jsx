// app/buy/[slotId]/page.jsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";
import LogoUpload from "@/app/components/LogoUpload";
import { isAdActive, computeValidUntil } from "@/lib/adUtils";

export const dynamic = "force-dynamic";

function toNumber(value) {
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatDateTimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // YYYY-MM-DDTHH:MM
  return d.toISOString().slice(0, 16);
}

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateOnly(date) {
  // YYYY-MM-DD
  return date.toISOString().slice(0, 10);
}

/**
 * Server action: sukuria reklamą konkrečiam slotui
 * + jei pažymėtas checkbox "generateInvoice" – bando sukurti sąskaitą.
 * Jei sąskaitos nepavyksta sukurti, reklama vis tiek lieka.
 */
async function createAdForSlot(formData) {
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

  if (profileError) {
    console.error("createAdForSlot profile ERROR:", profileError);
    redirect("/dashboard/ads?error=create_failed");
  }

  if (!profile?.is_admin) {
    redirect("/dashboard/ads?error=create_failed");
  }

  const slotId = formData.get("slotId");
  const title = (formData.get("title") || "").toString().trim();
  const url = (formData.get("url") || "").toString().trim();
  const imageUrl = (formData.get("imageUrl") || "").toString().trim();
  const priceInput = formData.get("price");
  const isAnimated = formData.get("isAnimated") === "on";
  const validUntilInput = formData.get("validUntil");

  const generateInvoice = formData.get("generateInvoice") === "on";

  const clientName = (formData.get("clientName") || "")
    .toString()
    .trim();
  const clientCode = (formData.get("clientCode") || "")
    .toString()
    .trim();
  const clientVatCode = (formData.get("clientVatCode") || "")
    .toString()
    .trim();
  const clientAddress = (formData.get("clientAddress") || "")
    .toString()
    .trim();
  const clientEmail = (formData.get("clientEmail") || "")
    .toString()
    .trim();

  if (!slotId || !title || !url) {
    console.error("createAdForSlot: missing required fields", {
      slotId,
      title,
      url,
    });
    redirect("/dashboard/ads?error=create_failed");
  }

  // Pasiimam slotą (be jokių joinų – tik žali duomenys)
  const { data: slot, error: slotError } = await supabase
    .from("slots")
    .select("*")
    .eq("id", slotId)
    .maybeSingle();

  if (slotError || !slot) {
    console.error("createAdForSlot: slot ERROR:", slotError);
    redirect("/dashboard/ads?error=create_failed");
  }

  // Mėnesiai – fallback galiojimo datai
  const months = toNumber(slot.duration_months) ?? 12;

  // Galiojimo data pagal kalendorių arba fallback mėnesiais
  const validUntilDate = computeValidUntil({
    explicit: validUntilInput,
    baseDate: new Date(),
    months,
    fallbackMonths: 12,
  });

  // Kaina
  const priceFromForm = toNumber(priceInput);
  const priceFromSlot =
    slot.price != null ? Number(slot.price) : null;
  const finalPrice = priceFromForm ?? priceFromSlot ?? 0;

  // Sukuriam reklamą
  const adInsertPayload = {
    slot_id: slot.id,
    created_by: user.id,
    title,
    url,
    duration_months: months,
    price: finalPrice,
    is_animated: isAnimated,
    valid_until: validUntilDate ? validUntilDate.toISOString() : null,
    image_url: imageUrl || null,
  };

  const { data: ad, error: adError } = await supabase
    .from("ads")
    .insert(adInsertPayload)
    .select("*")
    .single();

  if (adError || !ad) {
    console.error("createAdForSlot: insert ad ERROR:", adError);
    redirect("/dashboard/ads?error=create_failed");
  }

  // Pririšam reklamą prie sloto
  const { error: slotUpdateError } = await supabase
    .from("slots")
    .update({ ad_id: ad.id })
    .eq("id", slot.id);

  if (slotUpdateError) {
    console.error(
      "createAdForSlot: update slot ERROR:",
      slotUpdateError
    );
    redirect("/dashboard/ads?error=create_failed");
  }

  // Sąskaitos generavimas – NEkritinis, jei kažkas sugriūva, reklama lieka
  if (generateInvoice) {
    try {
      const now = new Date();
      const issueDateStr = formatDateOnly(now);
      const dueDateStr = formatDateOnly(addDays(now, 14)); // +14 d.

      const qty = 1;
      const net = finalPrice;
      const vatRate = 0;
      const vatAmount = 0;
      const gross = net;

      const description = `Reklamos talpinimas kataloge. Reklama: „${title}“`;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          ad_id: ad.id,
          issue_date: issueDateStr,
          due_date: dueDateStr,
          currency: "EUR",

          client_name: clientName || null,
          client_code: clientCode || null,
          client_vat_code: clientVatCode || null,
          client_address: clientAddress || null,
          client_email: clientEmail || null,

          description,
          quantity: qty,
          unit_price: net,
          total_without_vat: net,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          total_with_vat: gross,

          status: "issued",
        })
        .select("id")
        .single();

      if (invoiceError || !invoice) {
        console.error(
          "createAdForSlot: invoice insert ERROR:",
          invoiceError
        );
      }
      // Daugiau nebeatnaujinam ads.invoice_id – šito stulpelio DB nebėra
    } catch (invoiceFatalError) {
      console.error(
        "createAdForSlot: invoice generation FATAL:",
        invoiceFatalError
      );
      // sąmoningai neredirectinam – reklama jau sukurta
    }
  }

  // Revalidate + redirect
  revalidatePath("/");
  revalidatePath("/dashboard/ads");
  revalidatePath(`/ad/${ad.id}`);

  // Norim redirectinti į tą kategoriją (jei įmanoma)
  let categorySlug = null;
  if (slot.category_id) {
    try {
      const { data: cat } = await supabase
        .from("categories")
        .select("slug")
        .eq("id", slot.category_id)
        .maybeSingle();
      categorySlug = cat?.slug || null;
    } catch (catErr) {
      console.error("createAdForSlot: category fetch ERROR:", catErr);
    }
  }

  let redirectUrl = "/dashboard/ads?view=slots&success=created";
  if (categorySlug) {
    redirectUrl = `/dashboard/ads?view=slots&category=${categorySlug}&success=created`;
  }

  redirect(redirectUrl);
}

/**
 * Puslapis: sukurti reklamą pasirinktame slote
 */
export default async function BuySlotPage({ params }) {
  const { slotId } = await params;

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
    console.error("BuySlotPage profile ERROR:", profileError);
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-500">
        Neturi teisių kurti reklamos.
      </div>
    );
  }

  // Slotas
  const { data: slot, error: slotError } = await supabase
    .from("slots")
    .select("*")
    .eq("id", slotId)
    .maybeSingle();

  if (slotError || !slot) {
    console.error("BuySlotPage slot ERROR:", slotError, "slotId:", slotId);
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-500">
        Nepavyko rasti šios reklamos vietos.
      </div>
    );
  }

  // Kategorija
  let category = null;
  if (slot.category_id) {
    const { data: cat } = await supabase
      .from("categories")
      .select("*")
      .eq("id", slot.category_id)
      .maybeSingle();
    category = cat || null;
  }

  // Esama reklama (jei yra)
  let existingAd = null;
  if (slot.ad_id) {
    const { data: ad } = await supabase
      .from("ads")
      .select("*")
      .eq("id", slot.ad_id)
      .maybeSingle();
    existingAd = ad || null;
  }

  const now = new Date();
  const hasActiveAd = isAdActive(existingAd, now);
  const isTaken = hasActiveAd;

  const defaultMonths =
    typeof slot.duration_months === "number" &&
    !Number.isNaN(slot.duration_months)
      ? slot.duration_months
      : 12;

  const defaultValidUntilDate = computeValidUntil({
    explicit: null,
    baseDate: new Date(),
    months: defaultMonths,
    fallbackMonths: 12,
  });

  const defaultValidUntilValue = formatDateTimeLocal(
    defaultValidUntilDate
  );

  const existingValidUntil = existingAd?.valid_until
    ? new Date(existingAd.valid_until)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
          {category?.name || "Reklamos vieta"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {isTaken
            ? "Ši reklamos vieta šiuo metu užimta"
            : "Sukurti reklamą šioje vietoje"}
        </h1>
        <p className="text-sm text-gray-600">
          Eilė {slot.row_number}, vieta {slot.slot_number}.
        </p>
      </header>

      {isTaken && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 space-y-1">
          <p>
            Šioje vietoje jau yra aktyvi reklama
            {existingAd?.title ? `: „${existingAd.title}“` : ""}.
          </p>
          {existingValidUntil && (
            <p>
              Galioja iki:{" "}
              <span className="font-semibold">
                {existingValidUntil.toLocaleString("lt-LT")}
              </span>
            </p>
          )}
          {existingAd && (
            <p>
              <Link
                href={`/ad/${existingAd.id}`}
                className="font-semibold underline"
              >
                Peržiūrėti reklamą
              </Link>
            </p>
          )}
        </div>
      )}

      {!isTaken && (
        <form action={createAdForSlot} className="space-y-5">
          <input type="hidden" name="slotId" value={slot.id} />

          <div className="space-y-1">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-800"
            >
              Reklamos pavadinimas (anchor tekstas)
            </label>
            <input
              id="title"
              name="title"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-[11px] text-gray-500">
              Šis tekstas bus rodomas slote ir naudojamas kaip nuorodos
              tekstas.
            </p>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-800"
            >
              Nuoroda (URL)
            </label>
            <input
              id="url"
              name="url"
              type="url"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Logotipo įkėlimas */}
          <LogoUpload name="imageUrl" bucket="ad-logos" />

          {/* Galiojimo data per kalendorių */}
          <div className="space-y-1">
            <label
              htmlFor="validUntil"
              className="block text-sm font-medium text-gray-800"
            >
              Galioja iki
            </label>
            <input
              id="validUntil"
              name="validUntil"
              type="datetime-local"
              defaultValue={defaultValidUntilValue}
              step={60}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-[11px] text-gray-500">
              Galiojimo datą nustatyk kalendoriumi. Jei paliksi tuščią,
              sistema paskaičiuos automatiškai (pvz. apie 12 mėn. nuo šiandien).
            </p>
          </div>

          {/* Kaina – atskiroje eilėje */}
          <div className="space-y-1">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-800"
            >
              Kaina už visą laikotarpį (€)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={
                typeof slot.price === "number"
                  ? slot.price
                  : Number(slot.price || 0)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-[11px] text-gray-500">
              Jei paliksi tuščią – bus naudojama sloto kaina (jei yra).
            </p>
          </div>

          <div className="space-y-1">
            <span className="block text-sm font-medium text-gray-800">
              Tipas
            </span>
            <label className="inline-flex items-center gap-2 mt-2 text-sm text-gray-800">
              <input
                type="checkbox"
                name="isAnimated"
                defaultChecked={slot.is_animated || false}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Animuota reklama</span>
            </label>
          </div>

          {/* Sąskaitos generavimas */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2">
              <input
                id="generateInvoice"
                type="checkbox"
                name="generateInvoice"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="generateInvoice"
                className="text-sm font-medium text-gray-800"
              >
                Generuoti sąskaitą faktūrą?
              </label>
            </div>
            <p className="text-[11px] text-gray-500">
              Jei nenori sąskaitos (pvz. nemokama / barterinė reklama) –
              šio langelio nepažymėk ir formos žemiau pildyti nereikia.
            </p>

            <div className="mt-2 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Užsakovo rekvizitai (naudojami tik jei generuojama sąskaita)
              </label>

              <input
                name="clientName"
                placeholder="Įmonės pavadinimas"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  name="clientCode"
                  placeholder="Įmonės kodas"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                />
                <input
                  name="clientVatCode"
                  placeholder="PVM kodas (jei yra)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <input
                name="clientAddress"
                placeholder="Adresas"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
              <input
                name="clientEmail"
                type="email"
                placeholder="El. paštas sąskaitai"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />

              <p className="text-[11px] text-gray-500">
                Sąskaita bus išrašoma be PVM (esi ne PVM mokėtojas), suma =
                reklamos kaina.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Link
              href="/dashboard/ads"
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              ← Grįžti į reklamas
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Išsaugoti reklamą
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
