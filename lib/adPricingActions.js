// lib/adPricingActions.js
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";

function hasError(err) {
  return !!(err && typeof err === "object" && Object.keys(err).length > 0);
}

function toNumber(value, fallback) {
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function saveAdPricingSettings(formData) {
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
    console.error("saveAdPricingSettings profile ERROR:", profileError);
    redirect("/dashboard/pricing?error=1");
  }

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  const id = (formData.get("id") || "").toString().trim() || null;

  const homepageTopRaw = (formData.get("homepageTopPrice") || "")
    .toString()
    .trim();
  const homepageOtherRaw = (formData.get("homepageOtherPrice") || "")
    .toString()
    .trim();
  const categoryPriceRaw = (formData.get("categoryPrice") || "")
    .toString()
    .trim();

  const homepage_top_price = toNumber(homepageTopRaw, 49);
  const homepage_other_price = toNumber(homepageOtherRaw, 39);
  const category_price = toNumber(categoryPriceRaw, 29);

  const payload = {
    homepage_top_price,
    homepage_other_price,
    category_price,
  };

  let upsertData = payload;
  if (id) {
    upsertData = { id, ...payload };
  }

  const { error: upsertError } = await supabase
    .from("ad_pricing_settings")
    .upsert(upsertData, { onConflict: "id" });

  if (hasError(upsertError)) {
    console.error("saveAdPricingSettings UPSERT ERROR:", upsertError);
    redirect("/dashboard/pricing?error=1");
  }

  revalidatePath("/dashboard/pricing");
  revalidatePath("/");
  revalidatePath("/(categories)"); // jei turi group'ą – nėra blogai, jei ne, tiesiog ignoruos
  redirect("/dashboard/pricing?success=1");
}
