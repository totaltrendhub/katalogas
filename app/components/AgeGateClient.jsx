"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgeGateClient({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const val = window.localStorage.getItem("ev_age_confirmed");
      if (val === "18+") {
        setAllowed(true);
      }
    } catch (e) {
      // ignoruojam localStorage klaidas
    } finally {
      setLoaded(true);
    }
  }, []);

  const handleConfirm = () => {
    try {
      window.localStorage.setItem("ev_age_confirmed", "18+");
    } catch (e) {
      // nieko tokio, jei nepavyksta – vistiek leisim
    }
    setAllowed(true);
  };

  const handleReject = () => {
    router.push("/");
  };

  // Kol dar tikrinam localStorage – nerodom nieko, kad nebūtų mirgėjimo
  if (!loaded) {
    return null;
  }

  // Jei nepatvirtinta – rodom 18+ ekraną
  if (!allowed) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl bg-gray-950/80 border border-gray-700 shadow-xl p-6 space-y-4">
          <h1 className="text-xl font-bold text-white">
            Turinio apribojimas 18+
          </h1>
          <p className="text-sm text-gray-300">
            Šioje kategorijoje gali būti suaugusiesiems skirto turinio. 
            Norėdami tęsti, patvirtinkite, kad jums yra ne mažiau kaip 18 metų.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition"
            >
              Man 18 metų ir daugiau
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="flex-1 inline-flex items-center justify-center rounded-full border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800 transition"
            >
              Man mažiau nei 18 metų
            </button>
          </div>

          <p className="text-[11px] text-gray-500 pt-1">
            Pasirinkimą{" "}
            <span className="font-medium text-gray-300">
              „Man 18 metų ir daugiau“
            </span>{" "}
            išsaugosime šiame įrenginyje, kad kitą kartą šio lango nerodytume.
          </p>
        </div>
      </div>
    );
  }

  // Patvirtino 18+ – rodom normalų puslapį
  return <>{children}</>;
}
