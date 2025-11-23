// app/layout.jsx

import "./globals.css";
import Header from "./components/header";
import Footer from "./components/Footer";

export const metadata = {
  metadataBase: new URL("https://elektroninesvizijos.lt"),
  title: {
    // Homepage
    default: "Internetinė reklama – VIP zona",
    // Visi kiti puslapiai: "%s | elektroninesvizijos.lt"
    template: "%s | elektroninesvizijos.lt",
  },
  description:
    "Internetinė reklama ir VIP reklamos zona: ilgalaikės reklamos vietos teminiuose tinklalapiuose su aiškia metine kaina. Reklama internete be paslėptų mokesčių.",
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
