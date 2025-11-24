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

function buildAdsRedirect({ categorySlug, success, error }) {
  const params = new URLSearchParams();
  params.set("view", "slots");
  if (categorySlug) params.set("category", categorySlug);
  if (success) params.set("success", success);
  if (error) params.set("error", error);
  return `/dashboard/ads?${params.toString()}`;
}

/**
 * Server action: sukuria reklamą konkrečiam slotui
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

  // kategorijos slug'as atkeliauja iš formos (hidden input)
  const categorySlug = (formData.get("categorySlug") || "")
    .toString()
    .trim();

  if (profileError) {
    console.error("createAdForSlot profile ERROR:", profileError);
    redirect(buildAdsRedirect({ categorySlug, error: "create_failed" }));
  }

  if (!profile?.is_admin) {
    redirect(buildAdsRedirect({ categorySlug, error: "create_failed" }));
  }

  const slotId = formData.get("slotId");
  const title = (formData.get("title") || "").toString().trim();
  const url = (formData.get("url") || "").toString().trim();
  const imageUrl = (formData.get("imageUrl") || "").toString().trim();
  const priceInput = formData.get("price");
  const isAnimated = formData.get("isAnimated") === "on";
  const validUntilInput = formData.get("validUntil");

  if (!slotId || !title || !url) {
    console.error("createAdForSlot: missing fields", {
      slotId,
      title,
      url,
    });
    redirect(buildAdsRedirect({ categorySlug, error: "create_failed" }));
  }

  // Slotas (be join'ų – paprasčiau ir mažiau šansų, kad nulūš)
  const { data: slot, error: slotError } = await supabase
    .from("slots")
    .select("*")
    .eq("id", slotId)
    .maybeSingle();

  if (slotError || !slot) {
    console.error("createAdForSlot: slot ERROR:", slotError);
    redirect(buildAdsRedirect({ categorySlug, error: "create_failed" }));
  }

  // Mėnesiai – fallback galiojimo datai, jei kalendorius tuščias
  const months =
    toNumber(slot.duration_months) != null
      ? toNumber(slot.duration_months)
      : 12;

  // Galiojimo data pagal kalendorių arba fallback mėnesiais
  const validUntilDate = computeValidUntil({
    explicit: validUntilInput,
    baseDate: new Date(),
    months,
    fallbackMonths: 12,
  });

  // Kaina
  const priceFromForm = toNumber(priceInput);
  const priceFromSlot = toNumber(slot.price);
  const finalPrice = priceFromForm ?? priceFromSlot ?? 0;

  // Kuriam reklamą
  const insertPayload = {
    slot_id: slot.id,
    created_by: user.id,
    title,
    url,
    duration_months: months,
    price: finalPrice,
    is_animated: isAnimated,
    valid_until: validUntilDate ? validUntilDate.toISOString() : null,
  };

  if (imageUrl) {
    insertPayload.image_url = imageUrl;
  }

  const { data: ad, error: adError } = await supabase
    .from("ads")
    .insert(insertPayload)
    .select("*")
    .single();

  if (adError || !ad) {
    console.error("createAdForSlot: insert ad ERROR:", adError);
    redirect(buildAdsRedirect({ categorySlug, error: "create_failed" }));
  }

  // Pririšam prie sloto
  const { error: slotUpdateError } = await supabase
    .from("slots")
    .update({ ad_id: ad.id })
    .eq("id", slot.id);

  if (slotUpdateError) {
    console.error("createAdForSlot: update slot ERROR:", slotUpdateError);
    redirect(buildAdsRedirect({ categorySlug, error: "create_failed" }));
  }

  // Revalidate + SUCCESS redirect
  revalidatePath("/");
  revalidatePath("/dashboard/ads");
  revalidatePath(`/ad/${ad.id}`);

  redirect(buildAdsRedirect({ categorySlug, success: "created" }));
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

  const defaultValidUntilValue = formatDateTimeLocal(defaultValidUntilDate);

  const existingValidUntil = existingAd?.valid_until
    ? new Date(existingAd.valid_until)
    : null;

  const backUrl = category
    ? `/dashboard/ads?view=slots&category=${category.slug}`
    : "/dashboard/ads?view=slots";

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
          <input
            type="hidden"
            name="categorySlug"
            value={category?.slug || ""}
          />

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

          {/* Tik kalendorius galiojimo datai */}
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
              sistema paskaičiuos automatiškai (pvz. apie {defaultMonths} mėn.
              nuo šiandien).
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

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Link
              href={backUrl}
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
