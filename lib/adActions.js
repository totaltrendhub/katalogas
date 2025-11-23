// lib/adActions.js
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

// KURTI REKLAMĄ KONKREČIAM SLOTUI
export async function createAdForSlotAction(formData) {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const slotId = formData.get("slotId");
    const title = (formData.get("title") || "").toString().trim();
    const url = (formData.get("url") || "").toString().trim();
    const imageUrl = (formData.get("imageUrl") || "").toString().trim();
    const priceInput = formData.get("price");
    const isAnimated = formData.get("isAnimated") === "on";

    const durationRaw = (
      formData.get("durationMonths") ||
      formData.get("durationOption") ||
      ""
    )
      .toString()
      .trim();

    const validUntilInput = formData.get("validUntil");

    if (!slotId || !title || !url) {
      console.error("createAdForSlotAction: missing required fields");
      return;
    }

    const supabase = await supabaseServer();

    const { data: slot, error: slotError } = await supabase
      .from("slots")
      .select("*")
      .eq("id", slotId)
      .maybeSingle();

    if (slotError || !slot) {
      console.error("createAdForSlotAction slot ERROR:", slotError);
      return;
    }

    const months =
      toNumber(durationRaw) ??
      toNumber(slot.duration_months) ??
      12;

    const priceFromForm = toNumber(priceInput);
    const priceFromSlot = toNumber(slot.price);
    const finalPrice = priceFromForm ?? priceFromSlot ?? 0;

    const validUntilDate = computeValidUntil({
      explicit: validUntilInput,
      baseDate: new Date(),
      months,
      fallbackMonths: 12,
    });

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
      console.error("createAdForSlotAction insert ad ERROR:", adError);
      return;
    }

    const { error: updateError } = await supabase
      .from("slots")
      .update({ ad_id: ad.id })
      .eq("id", slot.id);

    if (updateError) {
      console.error("createAdForSlotAction update slot ERROR:", updateError);
      return;
    }

    revalidatePath("/");
    revalidatePath("/dashboard/ads");
    revalidatePath(`/ad/${ad.id}`);

    redirect("/dashboard/ads?success=created");
  } catch (err) {
    console.error("createAdForSlotAction FATAL:", err);
  }
}

// ATNAUJINTI EXISTING REKLAMĄ (duration + valid_until)
export async function updateAdAction(formData) {
  try {
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
      return;
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
      console.error("updateAdAction fetch existing ERROR:", existingError);
      return;
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
      return;
    }

    revalidatePath("/");
    revalidatePath("/dashboard/ads");
    revalidatePath(`/ad/${adId}`);

    redirect("/dashboard/ads?success=updated");
  } catch (err) {
    console.error("updateAdAction FATAL:", err);
  }
}

// IŠTRINTI REKLAMĄ (IR ATLAISVINTI SLOTĄ)
export async function deleteAdAction(formData) {
  try {
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
      return;
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
      }
    }

    const { error: deleteError } = await supabase
      .from("ads")
      .delete()
      .eq("id", adId);

    if (deleteError) {
      console.error("deleteAdAction delete ERROR:", deleteError);
      return;
    }

    revalidatePath("/");
    revalidatePath("/dashboard/ads");

    redirect("/dashboard/ads?success=deleted");
  } catch (err) {
    console.error("deleteAdAction FATAL:", err);
  }
}
