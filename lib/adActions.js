"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { computeValidUntil } from "@/lib/adUtils";

function toNumber(value) {
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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
 * KURTI REKLAMĄ KONKREČIAM SLOTUI
 * Naudojama iš /buy/[slotId] formos.
 */
export async function createAdForSlotAction(formData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const slotId = formData.get("slotId");
  const title = (formData.get("title") || "").toString().trim();
  const url = (formData.get("url") || "").toString().trim();
  const imageUrl = (formData.get("imageUrl") || "").toString().trim();
  const priceInput = formData.get("price");
  const isAnimated = formData.get("isAnimated") === "on";
  const validUntilInput = formData.get("validUntil");
  const categorySlug = (formData.get("categorySlug") || "")
    .toString()
    .trim();

  if (!slotId || !title || !url) {
    console.error("createAdForSlotAction: missing required fields", {
      slotId,
      title,
      url,
    });
    redirect(
      buildAdsRedirect({ categorySlug, error: "create_failed" })
    );
  }

  const supabase = await supabaseServer();

  // admin check
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.is_admin) {
    console.error(
      "createAdForSlotAction: profile/admin ERROR:",
      profileError
    );
    redirect(
      buildAdsRedirect({ categorySlug, error: "create_failed" })
    );
  }

  // Slotas
  const { data: slot, error: slotError } = await supabase
    .from("slots")
    .select("*")
    .eq("id", slotId)
    .maybeSingle();

  if (slotError || !slot) {
    console.error("createAdForSlotAction slot ERROR:", slotError);
    redirect(
      buildAdsRedirect({ categorySlug, error: "create_failed" })
    );
  }

  // Mėnesiai – dabar nebeimame iš formos, naudojame sloto numatytą trukmę
  const months =
    toNumber(slot.duration_months) ??
    12;

  // Galiojimo data – jei formoje nenurodyta, skaičiuojam pagal mėnesius
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

  const insertPayload = {
    slot_id: slot.id,
    created_by: user.id,
    title,
    url,
    duration_months: months,
    price: finalPrice,
    is_animated: isAnimated,
    valid_until: validUntilDate
      ? validUntilDate.toISOString()
      : null,
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
    console.error(
      "createAdForSlotAction insert ad ERROR:",
      adError
    );
    redirect(
      buildAdsRedirect({ categorySlug, error: "create_failed" })
    );
  }

  // Pririšam prie sloto
  const { error: updateError } = await supabase
    .from("slots")
    .update({ ad_id: ad.id })
    .eq("id", slot.id);

  if (updateError) {
    console.error(
      "createAdForSlotAction update slot ERROR:",
      updateError
    );
    redirect(
      buildAdsRedirect({ categorySlug, error: "create_failed" })
    );
  }

  // Revalidate + SUCCESS redirect
  revalidatePath("/");
  revalidatePath("/dashboard/ads");
  revalidatePath(`/ad/${ad.id}`);

  redirect(
    buildAdsRedirect({ categorySlug, success: "created" })
  );
}

/**
 * ATNAUJINTI EXISTING REKLAMĄ
 */
export async function updateAdAction(formData) {
  const user = await getCurrentUser();
  if (!user) return;

  const adId = formData.get("adId");
  if (!adId) return;

  const title = (formData.get("title") || "").toString().trim();
  const url = (formData.get("url") || "").toString().trim();
  const imageUrl = (formData.get("imageUrl") || "").toString().trim();
  const priceInput = formData.get("price");
  const isAnimated = formData.get("isAnimated") === "on";

  const durationMonthsInput = formData.get("durationMonths");
  const validUntilInput = formData.get("validUntil");

  if (!title || !url) {
    console.error("updateAdAction: missing required fields");
    redirect("/dashboard/ads?error=update_failed");
  }

  const priceFromForm = toNumber(priceInput);
  const durationFromForm = toNumber(durationMonthsInput);

  const supabase = await supabaseServer();

  const { data: existing, error: existingError } = await supabase
    .from("ads")
    .select("*")
    .eq("id", adId)
    .maybeSingle();

  if (existingError || !existing) {
    console.error(
      "updateAdAction fetch existing ERROR:",
      existingError
    );
    redirect("/dashboard/ads?error=update_failed");
  }

  const updates = {
    title,
    url,
    image_url: imageUrl || null,
    is_animated: isAnimated,
  };

  if (priceFromForm !== null) {
    updates.price = priceFromForm;
  }

  const months =
    durationFromForm ??
    existing.duration_months ??
    12;

  if (durationFromForm !== null) {
    updates.duration_months = months;
  }

  const validUntilDate = computeValidUntil({
    explicit: validUntilInput,
    baseDate: existing.created_at || new Date(),
    months,
    fallbackMonths: 12,
  });

  if (validUntilInput || durationFromForm !== null) {
    updates.valid_until = validUntilDate
      ? validUntilDate.toISOString()
      : null;
  }

  const { error: updateError } = await supabase
    .from("ads")
    .update(updates)
    .eq("id", adId);

  if (updateError) {
    console.error("updateAdAction ERROR:", updateError);
    redirect("/dashboard/ads?error=update_failed");
  }

  revalidatePath("/");
  revalidatePath("/dashboard/ads");
  revalidatePath(`/ad/${adId}`);

  redirect("/dashboard/ads?success=updated");
}

/**
 * IŠTRINTI REKLAMĄ (IR ATLAISVINTI SLOTĄ)
 */
export async function deleteAdAction(formData) {
  const user = await getCurrentUser();
  if (!user) return;

  const adId = formData.get("adId");
  if (!adId) return;

  const supabase = await supabaseServer();

  const { data: ad, error: adError } = await supabase
    .from("ads")
    .select("id, slot_id")
    .eq("id", adId)
    .maybeSingle();

  if (adError || !ad) {
    console.error("deleteAdAction ad ERROR:", adError);
    redirect("/dashboard/ads?error=delete_failed");
  }

  if (ad.slot_id) {
    const { error: slotUpdateError } = await supabase
      .from("slots")
      .update({ ad_id: null })
      .eq("id", ad.slot_id);

    if (slotUpdateError) {
      console.error(
        "deleteAdAction slot update ERROR:",
        slotUpdateError
      );
      redirect("/dashboard/ads?error=delete_failed");
    }
  }

  const { error: deleteError } = await supabase
    .from("ads")
    .delete()
    .eq("id", adId);

  if (deleteError) {
    console.error("deleteAdAction delete ERROR:", deleteError);
    redirect("/dashboard/ads?error=delete_failed");
  }

  revalidatePath("/");
  revalidatePath("/dashboard/ads");

  redirect("/dashboard/ads?success=deleted");
}
