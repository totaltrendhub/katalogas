// app/taisykles/page.jsx

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Naudojimo taisyklės",
  description:
    "Elektroninesvizijos.lt reklamos katalogo naudojimo taisyklės: leidžiama tematika, reklamos priėmimo sąlygos, atsakomybės ribojimas, techniniai pakeitimai ir bendros nuostatos.",
};

export default function TaisyklesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Naudojimo taisyklės
        </h1>
        <p className="text-sm text-gray-600">
          Šios taisyklės nustato elektroninesvizijos.lt reklamos katalogo
          (toliau – Katalogas) naudojimo tvarką, reklamos talpinimo
          principus ir pagrindines šalių teises bei pareigas. Naudodamiesi
          Katalogu ar užsakydami reklamos vietą, patvirtinate, kad esate
          susipažinę su šiomis sąlygomis ir su jomis sutinkate.
        </p>
      </header>

      <div className="space-y-6 text-sm text-gray-700">
        {/* 1. BENDROS NUOSTATOS */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            1. Bendros nuostatos
          </h2>
          <p>
            1.1. Katalogo valdytojas suteikia galimybę rezervuoti ir
            talpinti ilgalaikes reklamos vietas VIP zonoje ir teminėse
            kategorijose. Reklama rodoma kaip nuoroda ir (ar) logotipas
            pasirinktame slote.
          </p>
          <p>
            1.2. Katalogo valdytojas turi teisę bet kuriuo metu
            atnaujinti, keisti ar papildyti šias taisykles. Atnaujintos
            taisyklės taikomos nuo jų paskelbimo Kataloge momento, nebent
            aiškiai nurodyta kitaip.
          </p>
          <p>
            1.3. Užsakydamas reklamos vietą užsakovas patvirtina, kad:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>turi teisę atstovauti reklamuojamam projektui;</li>
            <li>
              pateikti duomenys yra teisingi, aktualūs ir neklaidinantys;
            </li>
            <li>
              reklamuojamas tinklalapis atitinka galiojančius teisės aktus
              ir šias taisykles.
            </li>
          </ul>
        </section>

        {/* 2. LEIDŽIAMA TEMATIKA */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            2. Leidžiama tematika
          </h2>
          <p>
            2.1. Kataloge talpinamos tik teisėtos, Lietuvoje leidžiamos
            veiklos ir turinio nuorodos. Pagrindinis dėmesys skiriamas
            informaciniams, paslaugų, verslo, kultūros, edukacijos ir
            kitiems kokybiškiems interneto projektams.
          </p>
          <p>2.2. Kataloge <strong>netalpinamos</strong> nuorodos į:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              nelegalią veiklą, sukčiavimą, apgaulingas schemas ar
              abejotinus „greito praturtėjimo“ projektus;
            </li>
            <li>
              turinį, skatinantį smurtą, neapykantą, diskriminaciją,
              priekabiavimą ar kitaip pažeidžiantį žmogaus teises;
            </li>
            <li>
              pornografiją, erotinį turinį ar su tuo tiesiogiai susijusius
              projektus;
            </li>
            <li>
              azartinius lošimus, priklausomybes skatinančias veiklas,
              jeigu jos neatitinka teisinių reikalavimų ar nėra tinkamai
              licencijuotos;
            </li>
            <li>
              agresyvius, masiškai kopijuojamus ar techninius sprendimus
              išnaudojančius projektus, kurie akivaizdžiai prieštarauja
              paieškos sistemų gairėms.
            </li>
          </ul>
          <p>
            2.3. Katalogo valdytojas pasilieka teisę vertinti kiekvieną
            projektą individualiai ir spręsti, ar jo tematika ir turinys
            atitinka šio katalogo paskirtį ir kokybės standartus.
          </p>
        </section>

        {/* 3. REKLAMOS PRIĖMIMAS IR ATMETIMAS */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            3. Reklamos priėmimas, atmetimas ir pašalinimas
          </h2>
          <p>
            3.1. Prieš talpinant reklamą, Katalogo valdytojas peržiūri
            reklamuojamą tinklalapį: jo turinį, tematiką, struktūrą,
            reputaciją ir techninę būklę.
          </p>
          <p>
            3.2. Katalogo valdytojas turi teisę atsisakyti talpinti
            reklamą arba ją pašalinti, jeigu:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>projektas kelia reputacinę ar teisinę riziką;</li>
            <li>
              po laiko pakeičiamas tinklalapio turinys ir jis nebeatitinka
              šių taisyklių;
            </li>
            <li>
              naudojami apgaulingi ar agresyvūs rinkodaros sprendimai,
              klaidinanti informacija;
            </li>
            <li>
              pažeidžiami autorių teisių, prekių ženklų ar kiti
              intelektinės nuosavybės reikalavimai.
            </li>
          </ul>
          <p>
            3.3. Jei reklama nepriimama dar nepradėjus jos rodyti,
            apmokėjimas (jei jis atliktas) gali būti grąžintas. Jei reklama
            jau buvo rodoma, sprendimai dėl kompensacijų priimami
            individualiai, atsižvelgiant į faktinį rodymo laikotarpį.
          </p>
        </section>

        {/* 4. REKLAMOS TRUKMĖ IR TECHNINIAI POKYČIAI */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            4. Reklamos trukmė ir techniniai pokyčiai
          </h2>
          <p>
            4.1. Reklama talpinama nustatytam laikotarpiui (paprastai 12
            mėnesių ar ilgesniam terminui), kuris aiškiai suderinamas
            užsakymo metu. Galiojimo pabaigos data matoma administratoriaus
            sistemoje ir gali būti pratęsta naujam laikotarpiui.
          </p>
          <p>
            4.2. Siekiama, kad reklamos vieta būtų stabili ir nekeistų
            pozicijos. Tačiau dėl techninių, dizaino ar struktūrinių
            priežasčių gali būti atliekami atnaujinimai: keičiamas
            išdėstymas, stilius, koreguojami blokai ar atnaujinama
            infrastruktūra.
          </p>
          <p>
            4.3. Tokie techniniai pakeitimai nedaro įtakos pačiam reklamos
            galiojimo laikotarpiui – reklama nėra trumpinama dėl dizaino
            ar struktūros atnaujinimų.
          </p>
          <p>
            4.4. Katalogo valdytojas negarantuoja nenutrūkstamo veikimo:
            gali pasitaikyti laikinų sutrikimų, serverio atnaujinimų ar
            kitų techninių nesklandumų, kuriuos stengiamasi pašalinti per
            protingą terminą.
          </p>
        </section>

        {/* 5. UŽSAKOVO PAREIGOS IR DUOMENŲ TIKSLUMAS */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            5. Užsakovo pareigos ir duomenų tikslumas
          </h2>
          <p>
            5.1. Užsakovas atsako už tai, kad pateikta informacija
            (tinklalapio adresas, pavadinimas, logotipas, aprašymai ir
            kt.) būtų tiksli ir atnaujinta.
          </p>
          <p>
            5.2. Pasikeitus domenui, prekės ženklui ar projektui, užsakovas
            privalo apie tai informuoti Katalogo valdytoją, jei nori, kad
            reklamos vieta būtų koreguojama atitinkamai.
          </p>
          <p>
            5.3. Katalogo valdytojas neatsako už žalą arba nuostolius, kurie
            gali kilti dėl to, kad užsakovas nepateikė laiku atnaujintos
            informacijos arba pateikė klaidinančius duomenis.
          </p>
        </section>

        {/* 6. ATSKOMYBĖS RIBOJIMAS */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            6. Atsakomybės ribojimas
          </h2>
          <p>
            6.1. Katalogas nesuteikia garantijų dėl konkretaus lankytojų
            srauto, pardavimų, užklausų skaičiaus ar rezultatų paieškos
            sistemose. Tai yra nišinis reklamos kanalas, o rezultatai
            priklauso nuo daugelio išorinių veiksnių (projekto kokybės,
            konkurencijos, rinkodaros, sezoniškumo ir kt.).
          </p>
          <p>
            6.2. Katalogo valdytojas neatsako už technines ar turinio
            klaidas reklamuojamuose tinklalapiuose, trečiųjų šalių veiksmus
            ar paieškos sistemų algoritmų pokyčius.
          </p>
          <p>
            6.3. Katalogo valdytojas neatsako už netiesioginius ar
            pasekminius nuostolius (prarastas pajamas, prarastas galimybes
            ir pan.), jei tokie nuostoliai atsirado naudojantis Katalogu
            ar dėl trečiųjų šalių veiksmų.
          </p>
        </section>

        {/* 7. ASMENS DUOMENYS IR PRIVATUMAS */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            7. Asmens duomenys ir privatumas
          </h2>
          <p>
            7.1. Pagrindinė Katalogo veikla yra susijusi su tinklalapių
            ir projektų nuorodų talpinimu, todėl renkama labai ribota
            informacija apie užsakovus (kontaktiniai duomenys, įmonės
            rekvizitai ir pan.).
          </p>
          <p>
            7.2. Asmens duomenys tvarkomi laikantis galiojančių teisės
            aktų. Daugiau informacijos apie duomenų tvarkymą pateikiama
            Privatumo politikoje (jei toks dokumentas yra parengtas ir
            publikuotas atskirai).
          </p>
        </section>

        {/* 8. BAIGIAMOSIOS NUOSTATOS */}
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-800">
            8. Baigiamosios nuostatos
          </h2>
          <p>
            8.1. Šios taisyklės yra neatsiejama reklamos sutarties dalis,
            nepriklausomai nuo to, ar sutartis sudaroma žodžiu, ar
            raštu.
          </p>
          <p>
            8.2. Visi nesutarimai ar ginčai, kilę dėl šių taisyklių
            taikymo ar Katalogo naudojimo, sprendžiami derybomis. Nepavykus
            susitarti – Lietuvos Respublikos įstatymų nustatyta tvarka.
          </p>
          <p>
            8.3. Toliau naudodamiesi Katalogu po šių taisyklių pakeitimų,
            patvirtinate, kad su atnaujinta versija esate susipažinę ir
            sutinkate su joje numatytomis sąlygomis.
          </p>
        </section>
      </div>
    </div>
  );
}
