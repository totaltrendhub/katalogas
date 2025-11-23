// app/layout.jsx

import "./globals.css";
import Header from "./components/header";
import Footer from "./components/Footer";

const SITE_URL = "https://www.elektroninesvizijos.lt";

export const metadata = {
  // Čia nurodom bazinį domeną – iš jo Next.js sudėlios pilnus canonical
  metadataBase: new URL(SITE_URL),

  // Bendras title + šablonas visiems puslapiams
  title: {
    default: "Internetinė reklama – VIP zona | ElektroninesVizijos.lt",
    template: "%s | elektroninesvizijos.lt",
  },

  // Default meta description (home / fallback)
  description:
    "Internetinė reklama: VIP zona ir teminės reklamos kategorijos su aiškia metine kaina. Ilgalaikės reklamos vietos be rotacijos.",

  // Kanoninė nuoroda pagrindiniam puslapiui
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="lt">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Header />
        <div className="pt-4 pb-10">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
