// app/dashboard/ads/[id]/page.jsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { updateAdAction, deleteAdAction } from "@/lib/adActions";
import LogoUpload from "@/app/components/LogoUpload";

export const dynamic = "force-dynamic";

function formatDateTimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}

export default async function EditAdPage({ params }) {
  const { id } = await params;

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
    console.error("EditAdPage profile ERROR:", profileError);
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-500">
        Neturi teisių matyti šio puslapio.
      </div>
    );
  }

  const { data: ad, error: adError } = await supabase
    .from("ads")
    .select("*, slot:slots (id, row_number, slot_number, category_id)")
    .eq("id", id)
    .maybeSingle();

  if (adError || !ad) {
    console.error("EditAdPage ad ERROR:", adError);
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-500">
        Nepavyko rasti šios reklamos.
      </div>
    );
  }

  let category = null;
  if (ad.slot?.category_id) {
    const { data: cat } = await supabase
      .from("categories")
      .select("*")
      .eq("id", ad.slot.category_id)
      .maybeSingle();
    category = cat || null;
  }

  const validUntilInputValue = formatDateTimeLocal(ad.valid_until);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
          Reklamos redagavimas
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          {ad.title || "Reklama"}
        </h1>
        {ad.slot && (
          <p className="text-sm text-gray-600">
            {category ? `${category.name} • ` : ""}
            eilė {ad.slot.row_number}, vieta {ad.slot.slot_number}
          </p>
        )}
      </header>

      {/* UPDATE forma */}
      <form action={updateAdAction} className="space-y-5">
        <input type="hidden" name="adId" value={ad.id} />

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
            defaultValue={ad.title || ""}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
          />
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
            defaultValue={ad.url || ""}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* Logo upload su pradiniu URL */}
        <LogoUpload
          name="imageUrl"
          bucket="ad-logos"
          initialUrl={ad.image_url || ""}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-800"
            >
              Kaina (€)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={
                typeof ad.price === "number"
                  ? ad.price
                  : Number(ad.price || 0)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="durationMonths"
              className="block text-sm font-medium text-gray-800"
            >
              Laikotarpis (mėn.)
            </label>
            <input
              id="durationMonths"
              name="durationMonths"
              type="number"
              min="1"
              step="1"
              defaultValue={
                typeof ad.duration_months === "number"
                  ? ad.duration_months
                  : Number(ad.duration_months || 12)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
          </div>

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
              defaultValue={validUntilInputValue}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
            <p className="text-[11px] text-gray-500">
              Gali nustatyti net ir labai trumpą laiką (pvz. +5 min) testavimui.
              Jei paliksi tuščią – galiojimo data nesikeis.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <span className="block text-sm font-medium text-gray-800">
            Tipas
          </span>
          <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              name="isAnimated"
              defaultChecked={ad.is_animated || false}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Animuota reklama</span>
          </label>
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
            Išsaugoti pakeitimus
          </button>
        </div>
      </form>

      {/* DELETE forma */}
      <form
        action={deleteAdAction}
        className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 space-y-3"
      >
        <input type="hidden" name="adId" value={ad.id} />
        <p className="text-sm text-red-800">
          Jei ištrinsi šią reklamą, atitinkamas slotas bus atlaisvintas.
        </p>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full border border-red-600 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
        >
          Ištrinti reklamą
        </button>
      </form>
    </div>
  );
}
