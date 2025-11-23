// app/ad/[id]/page.jsx

import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import { isAdActive } from "@/lib/adUtils";

export const dynamic = "force-dynamic";

export default async function AdPublicPage(props) {
  const { params } = await props;
  const adId = params?.id;

  const supabase = await supabaseServer();

  const { data: ad, error: adError } = await supabase
    .from("ads")
    .select("*")
    .eq("id", adId)
    .maybeSingle();

  if (adError || !ad) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold mb-2">
          Ši reklama nerasta arba nebegalioja.
        </h1>
        <p className="text-sm text-gray-500">
          Gali būti, kad ji buvo ištrinta arba niekada neegzistavo.
        </p>
      </div>
    );
  }

  const { data: slot } = await supabase
    .from("slots")
    .select("*, categories(*)")
    .eq("id", ad.slot_id)
    .maybeSingle();

  const category = slot?.categories || null;
  const active = isAdActive(ad);

  if (!active) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-xl font-semibold">
          Ši reklama nebegalioja.
        </h1>
        <p className="text-sm text-gray-500">
          Reklamos galiojimo laikas pasibaigė arba slotas atlaisvintas.
        </p>

        <div className="mt-4 text-sm text-gray-500">
          <p>
            Pavadinimas:{" "}
            <span className="font-medium text-gray-900">
              {ad.title}
            </span>
          </p>
          <p>
            URL:{" "}
            <span className="break-all text-blue-600">{ad.url}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">{ad.title}</h1>
        {category && (
          <p className="text-sm text-gray-500">
            Kategorija:{" "}
            <Link
              href={
                category.slug === "vip-zona"
                  ? "/"
                  : `/${category.slug}`
              }
              className="text-blue-600 hover:underline"
            >
              {category.name}
            </Link>
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        {ad.image_url && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.image_url}
              alt={ad.title}
              className="max-h-40 object-contain"
            />
          </div>
        )}

        <p className="text-sm text-gray-700">
          Nuoroda:{" "}
          <a
            href={ad.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 break-all hover:underline"
          >
            {ad.url}
          </a>
        </p>

        <p className="text-sm text-gray-500">
          Galioja iki:{" "}
          {ad.valid_until
            ? new Date(ad.valid_until).toLocaleString("lt-LT")
            : "nenurodyta"}
        </p>
      </div>
    </div>
  );
}
