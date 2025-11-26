// app/kontaktai/page.jsx

export const dynamic = "force-dynamic";

export default function KontaktaiPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Kontaktai</h1>

      <p className="text-sm text-gray-600 mb-6">
        Reklamų katalogas valdomas rankiniu būdu – visos reklamos vietos
        derinamos individualiai. Parašykite, jei norite rezervuoti slotą
        arba turite klausimų dėl matomumo, nišos ar techninių reikalavimų.
      </p>

      <div className="space-y-4 text-sm">
        <div>
          <h2 className="font-semibold text-gray-800 mb-1">
            El. paštas
          </h2>
          <p>
            Bendri klausimai:{" "}
            <a
              href="mailto:info@elektroninesvizijos.lt"
              className="text-blue-600 hover:text-blue-800"
            >
              info@elektroninesvizijos.lt
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-800 mb-1">Telefonas</h2>
          <p>
            Konsultacijos ir rezervacijos:{" "}
            <a
              href="tel:+37060000000"
              className="text-blue-600 hover:text-blue-800"
            >
              +370 689 78433
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-800 mb-1">
            Darbo principas
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>pasižiūrite laisvas vietas kataloge;</li>
            <li>
              parašote el. paštu su norimu slotu, laikotarpiu ir
              nuoroda;
            </li>
            <li>
              suderiname kainą ir sąlygas, išrašome sąskaitą ir
              įkeliame reklamą rankiniu būdu.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
