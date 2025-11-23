// lib/pricing.js

/**
 * Bazinė mėnesio kaina pagal kategoriją/ VIP ir eilę.
 * Jei slot.price yra užpildyta — laikom, kad tai bazinė mėnesio kaina ir ją naudojam.
 */
export function getBaseMonthlyPrice({ slot, categorySlug }) {
  if (!slot) return 0;

  // Jei DB jau įrašyta "price" — traktuojam kaip bazę per mėnesį
  if (slot.price !== null && slot.price !== undefined) {
    const n = Number(slot.price);
    if (!Number.isNaN(n) && n > 0) return n;
  }

  const isVip = categorySlug === "vip-zona";
  const row = Number(slot.row_number) || 1;

  if (isVip) {
    if (row === 1) return 200; // VIP TOP mėnesiui
    if (row === 2 || row === 3) return 120;
    return 80;
  } else {
    if (row === 1) return 80;
    if (row === 2 || row === 3) return 50;
    return 30;
  }
}

/**
 * Apskaičiuoja galutinę kainą pagal:
 * - bazinę mėnesio kainą
 * - trukmę (mėnesiais) + nuolaidą
 * - animaciją
 */
export function calculateAdPrice({
  slot,
  categorySlug,
  durationMonths,
  isAnimated,
}) {
  const baseMonthly = getBaseMonthlyPrice({ slot, categorySlug });
  const months = durationMonths || 1;

  const durationMultipliers = {
    1: 1,
    3: 0.9,
    6: 0.8,
    12: 0.7,
  };

  const durationMult = durationMultipliers[months] ?? 1;

  let price = baseMonthly * months * durationMult;

  if (isAnimated) {
    price *= 1.2; // +20% už animaciją
  }

  return Math.round(price * 100) / 100;
}
