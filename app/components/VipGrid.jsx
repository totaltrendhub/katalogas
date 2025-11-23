// app/components/VipGrid.jsx

import SlotGrid from "./SlotGrid";

export default function VipGrid({ slots }) {
  // Grupavimas pagal eilę
  const rowsMap = new Map();

  (slots || []).forEach((slot) => {
    const rowNumber = Number(slot.row_number) || 1;
    if (!rowsMap.has(rowNumber)) {
      rowsMap.set(rowNumber, []);
    }
    rowsMap.get(rowNumber).push(slot);
  });

  const rowNumbers = [...rowsMap.keys()].sort((a, b) => a - b);

  if (rowNumbers.length === 0) {
    return (
      <p className="mt-6 text-sm text-gray-500">
        Šioje kategorijoje dar nėra sukonfigūruotų slotų.
      </p>
    );
  }

  // TOP eilė – visada pati pirma (dažniausiai 1)
  const topRowNumber = rowNumbers[0];
  const topRowSlots = rowsMap.get(topRowNumber) || [];
  const otherRows = rowNumbers.slice(1);

  return (
    <div className="space-y-14">
      {/* TOP eilė */}
      {topRowSlots.length > 0 && (
        <section>
          <div
            className="
              sticky top-0 z-20 
              bg-gray-50/95 backdrop-blur 
              pt-2 pb-3 mb-3
              border-b border-gray-200
            "
          >
            <h2 className="text-sm font-semibold text-gray-900">
              TOP eilė
            </h2>
            </div>

          <SlotGrid slots={topRowSlots} />
        </section>
      )}

      {/* Kitos eilės */}
      {otherRows.map((rowNumber) => (
        <section key={rowNumber} className="space-y-3">
          <div
            className="
              sticky top-0 z-10 
              bg-gray-50/95 backdrop-blur 
              pt-3 pb-2
              border-b border-gray-200
            "
          >
            <h3 className="text-sm font-semibold text-gray-700">
              Eilė {rowNumber}
            </h3>
          </div>

          <SlotGrid slots={rowsMap.get(rowNumber) || []} />
        </section>
      ))}
    </div>
  );
}
