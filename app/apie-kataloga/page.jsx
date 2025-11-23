// app/apie-kataloga/page.jsx

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Apie reklamos katalogą",
  description:
    "Elektroninesvizijos.lt – ilgalaikių reklamos vietų katalogas su VIP zona ir teminėmis kategorijomis. Stabilios nuorodos, fiksuotos pozicijos ir rankinė projektų atranka.",
};

export default function ApieKatalogaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Apie reklamos katalogą
        </h1>
        <p className="text-sm text-gray-600">
          Elektroninesvizijos.lt yra ilgalaikių reklamos vietų katalogas,
          kuriame reklamos pozicijos yra stabilios, aiškiai apibrėžtos ir
          skirstomos į VIP zoną bei temines kategorijas. Čia nėra
          triukšmingų banerių, automatinių rotacijų ar chaotiškų skydelių
          – kiekviena reklamos vieta yra konkreti, fiksuota ir prižiūrima.
        </p>
      </header>

      {/* VIP + TEMINĖ STRUKTŪRA */}
      <section className="space-y-2 text-sm text-gray-700">
        <h2 className="font-semibold text-gray-800">
          VIP zona ir teminės kategorijos
        </h2>
        <p>
          Pagrindinis katalogo puslapis – VIP zona. Čia pateikiamos
          išskirtinės reklamos vietos, matomos iškart atidarius
          elektroninesvizijos.lt. VIP zonoje slotai (reklamos langeliai)
          išdėstyti eilėmis, o viršutinė eilė turi didžiausią matomumą.
        </p>
        <p>
          Žemiau VIP zonos yra teminės kategorijos: informacija, verslas ir
          finansai, turizmas ir kelionės, pramogos, technologijos, kultūra,
          šeima, sveikata ir kitos sritys. Kiekvienoje kategorijoje
          reklamos vietos taip pat išdėstytos tinkleliu – pagal eilę ir
          vietos numerį. Kiekvienas slotas yra aiški, konkreti pozicija,
          kurioje rodomas logotipas ir nuoroda į reklamuojamą tinklalapį.
        </p>
      </section>

      {/* ILGALAIKĖ FILOSOFIJA */}
      <section className="space-y-2 text-sm text-gray-700">
        <h2 className="font-semibold text-gray-800">
          Ilgalaikės, stabilios reklamos vietos
        </h2>
        <p>
          Šio katalogo esmė – ilgalaikė internetinė reklama, o ne trumpi
          ir agresyvūs kampanijų šuoliai. Reklamos vietos rezervuojamos
          metams ar ilgesniam laikotarpiui, todėl projektai nesikeičia kas
          kelias dienas ir nesudaro įspūdžio, kad viskas nuolat „mirga“.
        </p>
        <p>
          Kiekvienas slotas turi aiškią kainą ir laikotarpį. Nuorodos yra
          stabilios, pozicijos nesikeičia automatiškai, o katalogas
          formuojamas taip, kad lankytojai rastų tematiškai susijusius,
          kokybiškus projektus, o ne atsitiktinį reklamų mišinį.
        </p>
      </section>

      {/* RANKINĖ ATRANKA IR KOKYBĖ */}
      <section className="space-y-2 text-sm text-gray-700">
        <h2 className="font-semibold text-gray-800">
          Rankinė atranka ir administravimas
        </h2>
        <p>
          Paprastiems lankytojams kataloge nereikia registruotis ir nėra
          savitarnos paskyrų. Visi slotai pildomi rankiniu būdu per uždarą
          administratoriaus sąsają. Tai leidžia išvengti šlamšto, abejotinos
          reputacijos turinio ir projektų, kurie neatitinka bazinių
          kokybės standartų.
        </p>
        <p>
          Prieš įkeliant naują reklamos vietą, peržiūrimas pats tinklalapis:
          tematika, struktūra, techninė kokybė ir ar jis iš tikrųjų kuria
          vertę lankytojams. Tokiu būdu kataloge atsiranda tvarkingas,
          apgalvotas interneto projektų rinkinys, o ne atsitiktinė nuorodų
          kolekcija.
        </p>
      </section>

      {/* KAM SKIRTA */}
      <section className="space-y-2 text-sm text-gray-700">
        <h2 className="font-semibold text-gray-800">Kam skirtas katalogas?</h2>
        <p>
          Katalogas naudingas projektams, kurie nori matomumo ne vieną
          savaitę, o ilgesniam laikui. Tai tinkamas sprendimas:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>
            teminiams tinklalapiams, siekiantiems sustiprinti savo pozicijas
            internete;
          </li>
          <li>
            verslams, norintiems būti šalia tematiškai susijusių projektų,
            o ne atsitiktinių banerių sraute;
          </li>
          <li>
            ilgalaikiams projektams, kuriems svarbu stabilus, nuoseklus
            matomumas ir aiškus kontekstas.
          </li>
        </ul>
      </section>

      {/* NEMOKAMI SLOTai */}
      <section className="space-y-2 text-sm text-gray-700">
        <h2 className="font-semibold text-gray-800">
          Nekomerciniai projektai ir nemokamos vietos
        </h2>
        <p>
          Kataloge numatyta dalis vietų nekomerciniams, visuomenei naudą
          kuriantiems projektams. Tai gali būti kultūros, mokslo,
          edukacijos, iniciatyvų ar valstybinių institucijų tinklalapiai.
        </p>
        <p>
          Tokiems projektams reklamos vieta gali būti suteikiama nemokamai,
          tačiau galutinis sprendimas priimamas susipažinus su
          tinklalapiu, jo turiniu ir tikslais. Taip užtikrinama, kad
          katalogas išliktų tematiškai nuoseklus ir neprarastų kokybės.
        </p>
      </section>

      {/* STRAIPSNIAI IR TURINYS */}
      <section className="space-y-2 text-sm text-gray-700">
        <h2 className="font-semibold text-gray-800">
          Straipsniai ir papildomas turinys
        </h2>
        <p>
          Be reklamos vietų, kataloge gali būti talpinami ir straipsniai –
          teminiai tekstai, susiję su konkrečiomis sritimis ar projektais.
          Jie daugiausia orientuoti į paieškos sistemas ir organišką
          lankytojų srautą, todėl dažnai nėra akcentuojami meniu ar
          pagrindiniame puslapyje.
        </p>
        <p>
          Tokia struktūra leidžia išlaikyti švarų, aiškų reklamos išdėstymą,
          o straipsnius naudoti kaip papildomą informacinį sluoksnį: jie
          stiprina teminį kontekstą ir padeda pritraukti žmones, kurie
          ieško konkrečių temų ar nišinių sprendimų.
        </p>
      </section>

      {/* SANTRAUKA */}
      <section className="space-y-2 text-sm text-gray-700">
        <h2 className="font-semibold text-gray-800">Trumpai apibendrinant</h2>
        <p>
          Elektroninesvizijos.lt nėra dar viena agresyvi reklamos platforma.
          Tai ramus, struktūruotas reklamos katalogas, kuriame svarbiausia
          – tvarka, aiškios taisyklės ir ilgalaikiai sprendimai. Kiekviena
          reklamos vieta yra apgalvota, prižiūrima ir susieta su konkrečia
          temine niša.
        </p>
        <p>
          Jei jūsų projektui svarbu stabilus, patikimas buvimas internete,
          o ne trumpalaikės akcijos – šis katalogas sukurtas būtent tokio
          tipo reklamai.
        </p>
      </section>
    </div>
  );
}
