// app/privatumas/page.jsx

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privatumo politika",
  description:
    "Privatumo politika, paaiškinanti kaip elektroninesvizijos.lt tvarko duomenis: slapukai, reklamos užsakovų kontaktai, duomenų saugojimo terminai ir teisės.",
};

export default function PrivatumasPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Privatumo politika</h1>
        <p className="text-sm text-gray-600">
          Ši privatumo politika paaiškina, kokius duomenis tvarko
          elektroninesvizijos.lt reklamos katalogas, kokiais tikslais tai
          daroma ir kokias teises turite. Dokumentas taikomas tiek
          paprastiems svetainės lankytojams, tiek reklamos užsakovams.
        </p>
      </header>

      <div className="space-y-6 text-sm text-gray-700">
        {/* LANKYTOJAI IR SLAPUKAI */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            1. Lankytojai ir slapukai
          </h2>
          <p>
            Naršydami kataloge galite tai daryti neatskleisdami savo tapatybės
            – nerenkame registracijos duomenų, neveikia vartotojų paskyros.
          </p>
          <p>
            Svetainėje gali būti naudojami techniniai slapukai, reikalingi
            tinkamam puslapio veikimui (pvz., kalbos, išdėstymo ar sesijos
            nustatymams). Šie slapukai nenaudojami profiliavimui ar
            agresyviai rinkodarai, o jų veikimas apsiriboja būtinu
            funkcionalumu.
          </p>
        </section>

        {/* REKLAMOS INFORMACIJA */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            2. Reklamų ir projektų duomenys
          </h2>
          <p>
            Kataloge talpinant reklamą yra tvarkomi tik tie duomenys, kurie
            būtini reklamos vietai sukurti ir prižiūrėti. Paprastai tai:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>reklamuojamo tinklalapio adresas ir pavadinimas;</li>
            <li>
              logotipo arba ženklo nuoroda (jei naudojamas vizualinis
              elementas);
            </li>
            <li>
              pasirinktas slotas ir kategorija, reklamos galiojimo laikotarpis
              ir kaina;
            </li>
            <li>
              pagrindiniai kontaktiniai duomenys, reikalingi sąskaitoms ir
              bendravimui (pvz., el. paštas, įmonės pavadinimas).
            </li>
          </ul>
          <p>
            Ši informacija naudojama tik reklamos administravimui:
            rezervacijai, galiojimo laikui sekti, sąskaitoms išrašyti ir
            susisiekti projektų klausimais.
          </p>
        </section>

        {/* DUOMENŲ SAUGOJIMO TERMINAI */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            3. Duomenų saugojimo terminai
          </h2>
          <p>
            Reklamos ir su ja susiję duomenys saugomi visą reklamos galiojimo
            laiką ir protingą laikotarpį po jo pabaigos – apskaitos,
            ginčų sprendimo ar istorijos atsekamumo tikslais. Sąskaitoms ir
            buhalterinei apskaitai taikomi teisės aktuose nustatyti
            privalomi saugojimo terminai.
          </p>
          <p>
            Jei projektas nebetalpinamas ir nėra teisinio pagrindo duomenis
            saugoti ilgiau, informacija gali būti anonimizuojama arba
            ištrinami pertekliniai įrašai.
          </p>
        </section>

        {/* TREČIOSIOS ŠALYS */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            4. Duomenų perdavimas ir trečiosios šalys
          </h2>
          <p>
            Duomenys gali būti techniškai tvarkomi naudojantis
            patikimų paslaugų teikėjų infrastruktūra (pvz., serverių
            talpinimo, el. pašto ar analitikos paslaugomis). Pasirenkami tik
            tie tiekėjai, kurie užtikrina tinkamą duomenų apsaugos lygį ir
            laikosi taikomų teisės aktų.
          </p>
          <p>
            Duomenys neparduodami ir neperduodami tretiesiems asmenims
            rinkodaros tikslais. Informacija gali būti pateikiama tik
            teisėtus įgaliojimus turinčioms institucijoms, jeigu to reikalauja
            įstatymai.
          </p>
        </section>

        {/* JŪSŲ TEISĖS */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            5. Jūsų teisės
          </h2>
          <p>
            Jei su katalogu bendraujate kaip reklamos užsakovas ar kitaip
            pateikiate savo duomenis, turite šias teises:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>gauti informaciją, kokie jūsų duomenys yra tvarkomi;</li>
            <li>
              prašyti ištaisyti netikslius ar neišsamius duomenis;
            </li>
            <li>
              prašyti ištrinti duomenis, kai jie nebėra reikalingi ar
              tvarkomi be teisinio pagrindo;
            </li>
            <li>
              pateikti pastabas ar prieštarauti duomenų tvarkymui tam tikrais
              atvejais.
            </li>
          </ul>
        </section>

        {/* KONTAKTAI */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            6. Klausimai ir užklausos dėl duomenų
          </h2>
          <p>
            Dėl privatumo, duomenų tvarkymo ar norėdami pasinaudoti savo
            teisėmis, galite kreiptis el. paštu{" "}
            <a
              href="mailto:info@elektroninesvizijos.lt"
              className="text-blue-600 hover:text-blue-800"
            >
              info@elektroninesvizijos.lt
            </a>
            . Į užklausas stengiamasi atsakyti per pagrįstą terminą ir
            pateikti aiškų, suprantamą paaiškinimą.
          </p>
        </section>
      </div>
    </div>
  );
}
