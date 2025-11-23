// app/components/Footer.jsx

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between items-start sm:items-center">
        <div className="space-y-1">
          <p className="font-semibold text-gray-800">
            Reklamų katalogas
          </p>
          <p className="max-w-xs">
            Nišinė reklamos erdvė ilgalaikei matomumo pozicijai internete.
            Fiksuotos reklamos vietos, prižiūrimos rankiniu būdu, kad
            išliktų kokybiškas kontekstas ir tvarkingas išdėstymas.
          </p>
          <p className="text-[11px] text-gray-400">
            © 2025 ELEKTRONINESVIZIJOS.LT
          </p>
        </div>

        <div className="flex flex-wrap gap-10">
          <div className="space-y-1">
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
              Puslapiai
            </p>
            <nav className="space-y-1">
              <a href="/kainos" className="block hover:text-gray-800">
                Kainos
              </a>
              <a href="/apie-kataloga" className="block hover:text-gray-800">
                Apie katalogą
              </a>
              <a href="/kontaktai" className="block hover:text-gray-800">
                Kontaktai
              </a>
            </nav>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
              Teisinė informacija
            </p>
            <nav className="space-y-1">
              <a href="/privatumas" className="block hover:text-gray-800">
                Privatumo politika
              </a>
              <a href="/taisykles" className="block hover:text-gray-800">
                Naudojimo taisyklės
              </a>
            </nav>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
              Kontaktai
            </p>
            <p>
              El. paštas:{" "}
              <a
                href="mailto:info@elektroninesvizijos.lt"
                className="hover:text-gray-800"
              >
                info@elektroninesvizijos.lt
              </a>
            </p>
            <p>
              Tel.:{" "}
              <a href="tel:+37068978433" className="hover:text-gray-800">
                +370 689 78433
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
