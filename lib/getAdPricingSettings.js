// lib/getAdPricingSettings.js
import { supabaseServer } from "@/lib/supabaseServer";

const DEFAULTS = {
  homepage_top_price: 49,
  homepage_other_price: 39,
  category_price: 29,
};

export async function getAdPricingSettings() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("ad_pricing_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("getAdPricingSettings ERROR:", error);
    }
    return DEFAULTS;
  }

  return {
    homepage_top_price:
      typeof data.homepage_top_price === "number"
        ? data.homepage_top_price
        : Number(data.homepage_top_price) || DEFAULTS.homepage_top_price,
    homepage_other_price:
      typeof data.homepage_other_price === "number"
        ? data.homepage_other_price
        : Number(data.homepage_other_price) || DEFAULTS.homepage_other_price,
    category_price:
      typeof data.category_price === "number"
        ? data.category_price
        : Number(data.category_price) || DEFAULTS.category_price,
  };
}
