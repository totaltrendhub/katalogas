// app/dashboard/invoices/page.jsx

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { formatVilniusDate } from "@/lib/adUtils";

export const dynamic = "force-dynamic";

function toNumber(value) {
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function hasError(err) {
  return !!(err && typeof err === "object" && Object.keys(err).length > 0);
}

export default async function InvoicesDashboardPage(props) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status || "all";

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
    console.error("InvoicesDashboard profile ERROR:", profileError);
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-red-500">
        Neturi teisių matyti šio puslapio.
      </div>
    );
  }

  // Sąskaitos
  let query = supabase
    .from("invoices")
    .select(
      `
      id,
      number,
      issue_date,
      due_date,
      client_name,
      client_code,
      total_with_vat,
      currency,
      status,
      created_at,
      ad:ads!invoices_ad_id_fkey(
        id,
        title,
        slot:slots(
          row_number,
          slot_number,
          category:categories(
            name,
            slug
          )
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: invoices, error: invoicesError } = await query;

  if (hasError(invoicesError)) {
    console.error("InvoicesDashboard invoices ERROR:", invoicesError);
  }

  const rows = invoices || [];

  // Suvestinė
  const totalCount = rows.length;
  let totalSum = 0;

  for (const inv of rows) {
    const t = toNumber(inv.total_with_vat) ?? 0;
    totalSum += t;
  }

  // Statuso info
  const success = searchParams?.success || null;
  const error = searchParams?.error || null;

  let statusMessage = null;
  let statusType = null;

  if (success === "invoice_created") {
    statusType = "success";
    statusMessage = "Sąskaita sėkmingai sukurta.";
  } else if (success === "pdf_generated") {
    statusType = "success";
    statusMessage = "PDF failas sėkmingai sugeneruotas.";
  } else if (error === "invoice_failed") {
    statusType = "error";
    statusMessage =
      "Nepavyko sukurti sąskaitos. Patikrink duomenis arba serverio logus.";
  } else if (error === "pdf_failed") {
    statusType = "error";
    statusMessage =
      "Nepavyko sugeneruoti PDF failo. Patikrink serverio logus arba nustatymus.";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Sąskaitos (admin)</h1>

          <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-xs font-medium">
            <a
              href="/dashboard/ads?view=slots"
              className="rounded-full px-3 py-1 text-gray-600 hover:text-gray-900"
            >
              Reklamos
            </a>
            <a
              href="/dashboard/invoices"
              className="rounded-full px-3 py-1 bg-white shadow text-gray-900"
            >
              Sąskaitos
            </a>
          </div>
        </div>

        {/* Statuso juosta */}
        {statusMessage && (
          <div
            className={
              "rounded-xl border px-4 py-2 text-sm " +
              (statusType === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-red-300 bg-red-50 text-red-800")
            }
          >
            {statusMessage}
          </div>
        )}

        {/* Filtras + suvestinė */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                Sąskaitų suvestinė
              </h2>
              <p className="text-xs text-gray-500">
                Šiame sąraše matosi visos sąskaitos, susietos su reklamomis.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500">Filtruoti pagal statusą:</span>
              <a
                href="/dashboard/invoices"
                className={
                  "rounded-full px-3 py-1 border " +
                  (statusFilter === "all"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400")
                }
              >
                Visos
              </a>
              <a
                href="/dashboard/invoices?status=issued"
                className={
                  "rounded-full px-3 py-1 border " +
                  (statusFilter === "issued"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400")
                }
              >
                Išrašytos
              </a>
              <a
                href="/dashboard/invoices?status=draft"
                className={
                  "rounded-full px-3 py-1 border " +
                  (statusFilter === "draft"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400")
                }
              >
                Juodraščiai
              </a>
              <a
                href="/dashboard/invoices?status=cancelled"
                className={
                  "rounded-full px-3 py-1 border " +
                  (statusFilter === "cancelled"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-400")
                }
              >
                Atšauktos
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
              <p className="text-xs text-gray-500 mb-1">Sąskaitų skaičius</p>
              <p className="text-2xl font-semibold">{totalCount}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
              <p className="text-xs text-gray-500 mb-1">
                Bendra suma (su PVM)
              </p>
              <p className="text-xl font-semibold">
                {totalSum.toFixed(2)} €{" "}
                <span className="text-xs text-gray-500">
                  (PVM 0% – nesi PVM mokėtojas)
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
              <p className="text-xs text-gray-500 mb-1">Valiuta</p>
              <p className="text-xl font-semibold">EUR</p>
            </div>
          </div>
        </section>

        {/* Sąskaitų sąrašas */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <th className="px-3 py-2">Numeris</th>
                <th className="px-3 py-2">Klientas</th>
                <th className="px-3 py-2">Reklama</th>
                <th className="px-3 py-2">Išrašyta</th>
                <th className="px-3 py-2">Suma</th>
                <th className="px-3 py-2">Statusas</th>
                <th className="px-3 py-2">Veiksmai</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-4 text-center text-xs text-gray-500"
                  >
                    Kol kas nėra nė vienos sąskaitos.
                  </td>
                </tr>
              )}

              {rows.map((inv, idx) => {
                const amount = toNumber(inv.total_with_vat) ?? 0;

                let statusLabel = "Išrašyta";
                let statusClass =
                  "inline-flex items-center rounded-full bg-emerald-50 px-2 py-[2px] text-[11px] font-semibold text-emerald-700";

                if (inv.status === "draft") {
                  statusLabel = "Juodraštis";
                  statusClass =
                    "inline-flex items-center rounded-full bg-gray-50 px-2 py-[2px] text-[11px] font-semibold text-gray-700";
                } else if (inv.status === "cancelled") {
                  statusLabel = "Atšaukta";
                  statusClass =
                    "inline-flex items-center rounded-full bg-red-50 px-2 py-[2px] text-[11px] font-semibold text-red-700";
                }

                const slot = inv.ad?.slot || null;
                const category = slot?.category || null;

                return (
                  <tr
                    key={inv.id}
                    className={
                      "border-t border-gray-100 " +
                      (idx % 2 === 0 ? "bg-white" : "bg-gray-50/60")
                    }
                  >
                    <td className="px-3 py-2 text-xs">
                      <a
                        href={`/dashboard/invoices/${inv.id}`}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        {inv.number}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-gray-800">
                          {inv.client_name}
                        </span>
                        {inv.client_code && (
                          <span className="text-[11px] text-gray-500">
                            Kodas: {inv.client_code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {inv.ad ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-blue-700">
                            {inv.ad.title || "Reklama"}
                          </span>
                          {slot && (
                            <span className="text-[11px] text-gray-500">
                              {category?.name
                                ? `Kategorija: ${category.name}, `
                                : ""}
                              eilė {slot.row_number}, vieta{" "}
                              {slot.slot_number}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400">
                          Nesusieta
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {inv.issue_date ? (
                        <span className="text-[11px] text-gray-700">
                          {formatVilniusDate(inv.issue_date)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">
                          nenurodyta
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {amount.toFixed(2)} €{" "}
                      <span className="text-[11px] text-gray-500">
                        ({inv.currency || "EUR"})
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span className={statusClass}>{statusLabel}</span>
                    </td>
                    <td className="px-3 py-2 text-xs space-x-2">
                      <a
                        href={`/dashboard/invoices/${inv.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Peržiūra
                      </a>
                      {inv.ad && (
                        <a
                          href={`/ad/${inv.ad.id}`}
                          target="_blank"
                          rel="noopener"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Reklama
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
