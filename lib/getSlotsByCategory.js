// lib/getSlotsByCategory.js

import { supabaseServer } from "@/lib/supabaseServer";
import { isAdActive } from "@/lib/adUtils";

export async function getSlotsByCategory(slug) {
  const supabase = await supabaseServer();

  // 1) Kategorija pagal slug
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (categoryError || !category) {
    console.error("getSlotsByCategory category ERROR:", categoryError);
    return { category: null, slots: [] };
  }

  // 2) Visi šios kategorijos slotai
  const { data: slots, error: slotsError } = await supabase
    .from("slots")
    .select("*")
    .eq("category_id", category.id)
    .order("row_number", { ascending: true })
    .order("slot_number", { ascending: true });

  if (slotsError || !slots) {
    console.error("getSlotsByCategory slots ERROR:", slotsError);
    return { category, slots: [] };
  }

  // 3) Reklamos pagal ad_id
  const adIds = [
    ...new Set(slots.map((s) => s.ad_id).filter((id) => !!id)),
  ];

  let adsById = {};
  if (adIds.length > 0) {
    const { data: ads, error: adsError } = await supabase
      .from("ads")
      .select("*")
      .in("id", adIds);

    if (adsError) {
      console.error("getSlotsByCategory ads ERROR:", adsError);
    } else if (ads) {
      adsById = Object.fromEntries(ads.map((ad) => [ad.id, ad]));
    }
  }

  const now = new Date();

  // 4) Normalizuojam – pririšam ad objektą,
  // pasibaigusias nerodom (ad = null)
  const normalized = slots.map((slot) => {
    const rawAd = slot.ad_id ? adsById[slot.ad_id] || null : null;
    const ad = isAdActive(rawAd, now) ? rawAd : null;

    return {
      ...slot,
      ad,
      category_slug: slug,
    };
  });

  return { category, slots: normalized };
}
