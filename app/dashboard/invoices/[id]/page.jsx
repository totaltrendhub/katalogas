// app/dashboard/invoices/[id]/page.jsx

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { formatVilniusDate } from "@/lib/adUtils";
import { generateInvoicePdfAction } from "@/lib/invoiceActions";

export const dynamic = "force-dynamic";

function toNumber(value) {
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function hasError(err) {
  return !!(err && typeof err === "object" && Object.keys(err).length > 0);
}

export default async function InvoiceDetailPage(props) {
  const { params, searchParams } = props;

  const { id } = await params;
  const query = await searchParams;
  const success = query?.success || null;
  const error = query?.error || null;
  const debug = query?.debug || null;
  const detail = query?.detail || null;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await supabaseServer();

  // admin check
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (hasError(profileError)) {
    console.error("InvoiceDetail profile ERROR:", profileError);
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center text-red-500">
        Neturi teisių matyti šio puslapio.
      </div>
    );
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select(
      `
      id,
      number,
      issue_date,
      due_date,
      currency,
      client_name,
      client_code,
      client_vat_code,
      client_address,
      client_email,
      description,
      quantity,
      unit_price,
      total_without_vat,
      vat_rate,
      vat_amount,
      total_with_vat,
      status,
      pdf_url,
      created_at,
      ad:ads!invoices_ad_id_fkey(
        id,
        title,
        url,
        slot:slots(
          row_number,
          slot_number
        )
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (hasError(invoiceError)) {
    console.error("InvoiceDetail invoice ERROR:", invoiceError);
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Nepavyko rasti sąskaitos (ID: {id}).
            <br />
            Patikrink, ar sąskaita egzistuoja duomenų bazėje ir ar RLS
            taisyklės leidžia ją matyti. Taip pat pažiūrėk serverio logus –
            ten turėtų būti detalesnė klaida.
          </div>
          <a
            href="/dashboard/invoices"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            ← Grįžti į sąskaitų sąrašą
          </a>
        </main>
      </div>
    );
  }

  const amountNet = toNumber(invoice.total_without_vat) ?? 0;
  const amountVat = toNumber(invoice.vat_amount) ?? 0;
  const amountGross = toNumber(invoice.total_with_vat) ?? 0;
  const unitPrice = toNumber(invoice.unit_price) ?? 0;
  const qty = toNumber(invoice.quantity) ?? 1;
  const vatRate = toNumber(invoice.vat_rate) ?? 0;

  let statusLabel = "Išrašyta";
  let statusClass =
    "inline-flex items-center rounded-full bg-emerald-50 px-2 py-[2px] text-[11px] font-semibold text-emerald-700";

  if (invoice.status === "draft") {
    statusLabel = "Juodraštis";
    statusClass =
      "inline-flex items-center rounded-full bg-gray-50 px-2 py-[2px] text-[11px] font-semibold text-gray-700";
  } else if (invoice.status === "cancelled") {
    statusLabel = "Atšaukta";
    statusClass =
      "inline-flex items-center rounded-full bg-red-50 px-2 py-[2px] text-[11px] font-semibold text-red-700";
  }

  let flashMessage = null;
  let flashType = null;

  if (success === "pdf_generated") {
    flashMessage = "PDF failas sėkmingai sugeneruotas.";
    flashType = "success";
  } else if (error === "pdf_failed") {
    flashMessage =
      "Nepavyko sugeneruoti PDF failo. Patikrink serverio logus arba nustatymus.";
    flashType = "error";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Flash */}
        {flashMessage && (
          <div
            className={
              "rounded-xl border px-4 py-2 text-sm " +
              (flashType === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-red-300 bg-red-50 text-red-800")
            }
          >
            {flashMessage}
            {debug && (
              <div className="mt-1 text-[11px] opacity-80">
                Debug kodas: <code>{debug}</code>
              </div>
            )}
            {detail && (
              <div className="mt-1 text-[11px] opacity-80">
                Upload klaidos detalė:{" "}
                <code>{decodeURIComponent(detail)}</code>
              </div>
            )}
          </div>
        )}

        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Sąskaita faktūra</p>
            <h1 className="text-2xl font-bold">{invoice.number}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Išrašyta:{" "}
              {invoice.issue_date
                ? formatVilniusDate(invoice.issue_date)
                : "nenurodyta"}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className={statusClass}>{statusLabel}</span>

            {/* PDF mygtukas */}
            <form action={generateInvoicePdfAction}>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
              >
                {invoice.pdf_url ? "Pergeneruoti PDF" : "Generuoti PDF"}
              </button>
            </form>

            {invoice.pdf_url && (
              <a
                href={invoice.pdf_url}
                target="_blank"
                rel="noopener"
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Atsisiųsti esamą PDF
              </a>
            )}

            <a
              href="/dashboard/invoices"
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              ← Grįžti į sąskaitų sąrašą
            </a>
          </div>
        </header>

        {/* Kliento ir reklamos info */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-1">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Kliento rekvizitai
            </h2>
            <p className="text-sm text-gray-900">{invoice.client_name}</p>
            {invoice.client_code && (
              <p className="text-xs text-gray-600">
                Įmonės kodas: {invoice.client_code}
              </p>
            )}
            {invoice.client_vat_code && (
              <p className="text-xs text-gray-600">
                PVM kodas: {invoice.client_vat_code}
              </p>
            )}
            {invoice.client_address && (
              <p className="text-xs text-gray-600">
                Adresas: {invoice.client_address}
              </p>
            )}
            {invoice.client_email && (
              <p className="text-xs text-gray-600">
                El. paštas: {invoice.client_email}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-1">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Reklama
            </h2>
            {invoice.ad ? (
              <>
                <p className="text-sm text-gray-900">
                  {invoice.ad.title || "Reklama"}
                </p>
                {invoice.ad.url && (
                  <p className="text-xs text-gray-600 break-all">
                    URL:{" "}
                    <a
                      href={invoice.ad.url}
                      target="_blank"
                      rel="noopener"
                      className="text-blue-700 hover:text-blue-900"
                    >
                      {invoice.ad.url}
                    </a>
                  </p>
                )}
                {invoice.ad.slot && (
                  <p className="text-xs text-gray-600">
                    Eilė {invoice.ad.slot.row_number}, vieta{" "}
                    {invoice.ad.slot.slot_number}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  <a
                    href={`/ad/${invoice.ad.id}`}
                    target="_blank"
                    rel="noopener"
                    className="text-blue-700 hover:text-blue-900"
                  >
                    Peržiūrėti reklamą
                  </a>
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-500">
                Ši sąskaita nėra susieta su konkrečia reklama.
              </p>
            )}
          </div>
        </section>

        {/* Pozicija + sumos */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
            <h2 className="text-sm font-semibold text-gray-800">
              Sąskaitos pozicija
            </h2>
          </div>

          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <th className="px-3 py-2">Aprašymas</th>
                <th className="px-3 py-2">Kiekis</th>
                <th className="px-3 py-2">Kaina (be PVM)</th>
                <th className="px-3 py-2">Suma (be PVM)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100 bg-white">
                <td className="px-3 py-2 text-xs">
                  {invoice.description}
                </td>
                <td className="px-3 py-2 text-xs">
                  {qty.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {unitPrice.toFixed(2)} €{" "}
                  <span className="text-[11px] text-gray-500">
                    (be PVM)
                  </span>
                </td>
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {amountNet.toFixed(2)} €
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex flex-col items-end gap-1 px-4 py-3 sm:px-6 border-t border-gray-100">
            <div className="text-xs text-gray-700">
              Suma be PVM:{" "}
              <span className="font-semibold">
                {amountNet.toFixed(2)} €
              </span>
            </div>
            <div className="text-xs text-gray-700">
              PVM ({vatRate.toFixed(0)}%):{" "}
              <span className="font-semibold">
                {amountVat.toFixed(2)} €
              </span>{" "}
              <span className="text-[11px] text-gray-500">
                (esi ne PVM mokėtojas – PVM 0%)
              </span>
            </div>
            <div className="text-xs text-gray-900">
              Iš viso:{" "}
              <span className="text-base font-bold">
                {amountGross.toFixed(2)} €{" "}
                <span className="text-xs font-normal text-gray-600">
                  ({invoice.currency || "EUR"})
                </span>
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
