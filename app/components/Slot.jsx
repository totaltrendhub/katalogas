// app/components/Slot.jsx

function getSlotLabel(slot) {
  const row = Number(slot.row_number) || 1;
  const slotNumber = Number(slot.slot_number) || null;
  const isVip = slot.category_slug === "vip-zona";

  if (isVip && row === 1) {
    // VIP TOP zona
    return "TOP eilė";
  }

  if (slotNumber) {
    return `Eilė ${row}, vieta ${slotNumber}`;
  }

  return `Eilė ${row}`;
}

// Nauja kainodaros logika:
// VIP zona: 1 eilė – 49 €/metai, kitos eilės – 39 €/metai
// Kitos kategorijos: 29 €/metai
function getSlotAnnualPrice(slot) {
  if (!slot) return null;

  const isVip = slot.category_slug === "vip-zona";
  const row = Number(slot.row_number) || 1;

  if (isVip) {
    if (row === 1) return 49;
    return 39;
  }

  // Visos ne VIP kategorijos
  return 29;
}

export default function Slot({ slot }) {
  const ad = slot.ad || null;
  const isTaken = !!ad;

  const label = getSlotLabel(slot);
  const price = getSlotAnnualPrice(slot);

  const anchorText = ad?.anchor_text || ad?.title || "";

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white shadow-sm px-3 py-3 flex flex-col justify-between">
      {/* Viršutinė dalis: label + turinys */}
      <div className="space-y-2">
        {/* LAISVAM slotui rodome label'ą, užimtam – galim palikti švarų */}
        {!isTaken && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600">
            {label}
          </p>
        )}

        {isTaken ? (
          <>
            <div className="flex items-center justify-center h-16 mb-1">
              {ad.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ad.image_url}
                  alt={anchorText || ad.title}
                  className="max-h-14 max-w-[170px] w-full object-contain"
                />
              )}
            </div>
            {anchorText && (
              <a
                href={ad.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[13px] font-semibold text-blue-700 hover:text-blue-900 text-center break-words leading-snug"
              >
                {anchorText}
              </a>
            )}
          </>
        ) : (
          <>
            <p className="mb-1 text-sm font-semibold text-gray-900">
              Laisva vieta
            </p>
            <p className="text-[11px] text-gray-500">
              Metinė reklamos vieta pasirinktoje kategorijoje.
            </p>
          </>
        )}
      </div>

      {/* Apatinė dalis: kaina Laisvam slotui */}
      {!isTaken && price != null && (
        <div className="mt-3 border-t border-dashed border-gray-200 pt-2">
          <p className="text-xs text-gray-700">
            {price.toFixed(2)} €{" "}
            <span className="text-gray-500 font-normal">/ metai</span>
          </p>
        </div>
      )}
    </div>
  );
}
