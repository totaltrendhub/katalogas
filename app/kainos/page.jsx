// app/kainos/page.jsx

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reklamos kainos",
  description:
    "Reklamos kainos VIP zonoje ir teminėse kategorijose. Metinė internetinės reklamos kaina už slotą: VIP zona nuo 39 € iki 49 €, teminės kategorijos – 29 € per metus.",
};

export default function KainosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* PAGRINDINĖ ANTRAŠTĖ */}
      <header className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Reklamos kainos
        </h1>
        <p className="text-sm text-gray-600">
          Kainos taikomos už vieną reklamos vietą (slotą){" "}
          <strong>12 mėnesių</strong> laikotarpiui. Visi slotai yra
          ilgalaikės, stabilios internetinės reklamos vietos – be
          rotacijos ir be paslėptų „paketų“.
        </p>
        <p className="text-xs text-gray-500">
          Šios kainos yra startiniai tarifai pirmiesiems metams, skirti
          užpildyti katalogą kokybiškais projektais. Vėliau tarifai gali
          būti peržiūrimi.
        </p>
      </header>

      {/* VIP ZONA – PAGRINDINIS PUSLAPIS */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          VIP zona – pagrindinis puslapis
        </h2>
        <p className="text-sm text-gray-600">
          VIP zona yra pati matomiausia katalogo dalis – visi lankytojai
          ją pamato pirmiausia. Kiekvienas slotas čia rodo logotipą ir
          nuorodą į jūsų puslapį. Kaina priklauso nuo eilės: viršutinė
          eilė brangesnė, visos žemiau – šiek tiek pigesnės.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <th className="px-4 py-2">Eilė</th>
                <th className="px-4 py-2">Kaina / metai</th>
                <th className="px-4 py-2">Pastabos</th>
              </tr>
            </thead>
            <tbody>
              {/* 1 eilė */}
              <tr className="border-t border-gray-100 bg-white">
                <td className="px-4 py-2 text-xs">1 eilė (TOP zona)</td>
                <td className="px-4 py-2 text-xs font-semibold">
                  49,00 € / metai
                </td>
                <td className="px-4 py-2 text-xs text-gray-600">
                  Aukščiausia eilė, maksimalus matomumas visoje VIP
                  zonoje.
                </td>
              </tr>

              {/* 2+ eilės */}
              <tr className="border-t border-gray-100 bg-gray-50/60">
                <td className="px-4 py-2 text-xs">
                  2–8 eilės (visos žemiau)
                </td>
                <td className="px-4 py-2 text-xs font-semibold">
                  39,00 € / metai
                </td>
                <td className="px-4 py-2 text-xs text-gray-600">
                  Matomos VIP zonoje, tačiau žemiau TOP eilės. Kaina
                  vienoda visoms likusioms eilėms.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* TEMINĖS KATEGORIJOS */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Teminės kategorijos
        </h2>
        <p className="text-sm text-gray-600">
          Visose teminėse kategorijose (Informacija, Verslas, Turizmas ir
          t. t.) vieno sloto kaina yra vienoda – nepriklausomai nuo eilės
          ar vietos numerio. Tai paprastas ir skaidrus modelis, kuriame
          moka ne „kas atsisėdo anksčiau“, o kas nori ilgalaikio
          matomumo savo nišoje.
        </p>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Vieno sloto kaina
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                29 €{" "}
                <span className="text-sm font-normal text-gray-500">
                  / 12 mėn.
                </span>
              </p>
            </div>
            <div className="text-xs text-gray-600 text-right">
              <p>Galioja visoms teminėms kategorijoms:</p>
              <p>Informacija, verslas, finansai, turizmas, paslaugos,</p>
              <p>technologijos ir kitos ne VIP zonos sritys.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEMOKAMI SLOTai NEKOMERCINIAMS PROJEKTAMS */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Nemokami slotai nekomerciniams projektams
        </h2>
        <p className="text-sm text-gray-600">
          Dalį vietų kataloge rezervuojame nekomerciniams, visuomenei
          naudą kuriantiems projektams. Tai padeda užpildyti katalogą
          įdomiu turiniu ir duoda papildomo matomumo iniciatyvoms, kurios
          neturi reklamos biudžetų.
        </p>
        <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-4 space-y-2 text-sm text-emerald-900">
          <p className="font-semibold">
            Nemokami slotai gali būti skiriami šių sričių nekomerciniams
            tinklalapiams:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Kultūros projektai ir meno iniciatyvos.</li>
            <li>Mokslo, edukacijos ir švietimo projektai.</li>
            <li>
              Socialinės ir pilietinės iniciatyvos, bendruomenių projektai.
            </li>
            <li>Valstybinės institucijos ir viešojo sektoriaus projektai.</li>
          </ul>
          <p className="text-xs text-emerald-900/90 pt-1">
            Galutinį sprendimą dėl nemokamo sloto priimame susipažinę su
            siūlomu tinklalapiu, jo turiniu ir tikslu. Vietų skaičius
            ribotas.
          </p>
        </div>
      </section>

      {/* KAS ĮSKAIČIUOTA IR SĄLYGOS */}
      <section className="space-y-4 text-sm text-gray-700">
        <div className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            Kas įskaičiuota į kainą?
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Dofollow nuoroda</strong> į jūsų
              tinklalapį pasirinktoje kategorijoje arba VIP zonoje.
            </li>
            <li>
              <strong>Logotipas</strong> slote pagal sutartas dimensijas
              (statinis vaizdas).
            </li>
            <li>
              <strong>Stabili pozicija</strong> – slotas nekeičia vietos,
              nėra rotacijos ar automatinių rokiruočių.
            </li>
            <li>
              <strong>Rankinis įkėlimas ir peržiūra</strong> – kiekviena
              reklama patikrinama ir įkeliama ranka, kad katalogas
              išliktų kokybiškas.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            Papildomos sąlygos
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Kainos nurodytos už <strong>12 mėn.</strong> laikotarpį.
              Ilgesni laikotarpiai gali būti derinami individualiai.
            </li>
            <li>
              Animuotos reklamos, specialūs formatai ar nestandartiniai
              slotai derinami atskirai.
            </li>
            <li>
              Katalogas skirtas kokybiškiems projektams – saugome nuo
              šlamšto, „suaugusio“ turinio ir abejotinos reputacijos
              projektų.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
