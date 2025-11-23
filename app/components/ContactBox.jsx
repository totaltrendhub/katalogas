// app/components/ContactBox.jsx

export default function ContactBox() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Kaip rezervuoti reklamą?
        </p>
        <p className="mt-1 text-[11px] text-gray-600">
          Išsirinkite laisvą vietą ir susisiekite – viską sutvarkysime
          rankiniu būdu.
        </p>
      </div>

      <ul className="mt-1 space-y-1 text-[11px] text-gray-600">
        <li>• Pasirenkate kategoriją ir laisvą vietą.</li>
        <li>
          • Atsiunčiate mums savo puslapio pavadinimą, logotipą ir nuorodą.
        </li>
        <li>
          • Suderiname laikotarpį ir sąlygas, patalpiname reklamą.
        </li>
      </ul>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-[11px] font-semibold text-gray-800">
          Kontaktai:
        </p>
        <p className="mt-1 text-[11px] text-gray-700">
          Tel.: +370 689 784 33
        </p>
        <p className="text-[11px] text-gray-700">
          El. paštas:{" "}
          <a
            href="mailto:info@elektroninesvizijos.lt"
            className="text-blue-700 hover:text-blue-900 font-medium"
          >
            info@elektroninesvizijos.lt
          </a>
        </p>
      </div>
    </div>
  );
}
