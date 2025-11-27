// lib/invoiceActions.js
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { Buffer } from "buffer";
import { readFile } from "fs/promises";
import path from "path";

function hasError(err) {
  return !!(err && typeof err === "object" && Object.keys(err).length > 0);
}

function cleanText(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function safeLtDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  try {
    return date.toLocaleDateString("lt-LT");
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

// --- FONTŲ CACHE ---

let cachedFonts = null;

async function getInvoiceFonts() {
  if (cachedFonts) return cachedFonts;

  const base = path.join(process.cwd(), "public", "fonts");
  const regularPath = path.join(base, "invoice-regular.ttf");
  const boldPath = path.join(base, "invoice-bold.ttf");

  const [regular, bold] = await Promise.all([
    readFile(regularPath),
    readFile(boldPath),
  ]);

  cachedFonts = { regular, bold };
  return cachedFonts;
}

/**
 * Sugeneruoja sąskaitos PDF kaip Uint8Array, naudodama pdf-lib
 */
async function generateInvoicePdfBytes(invoice, settings) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const { regular, bold } = await getInvoiceFonts();
  const fontRegular = await pdfDoc.embedFont(regular);
  const fontBold = await pdfDoc.embedFont(bold);

  const fontSizeTitle = 26;
  const fontSizeNormal = 10;
  const margin = 50;

  // Pardavėjas
  const sellerName = cleanText(settings?.company_name || "Pardavėjas");
  const sellerCode = cleanText(settings?.company_code || "");
  const sellerVat = cleanText(settings?.vat_code || "");
  const sellerAddress = cleanText(settings?.address || "");
  const sellerBank = cleanText(settings?.bank_name || "");
  const sellerIban = cleanText(settings?.bank_account || "");
  const sellerEmail = cleanText(settings?.email || "");
  const sellerPhone = cleanText(settings?.phone || "");

  // Pirkėjas
  const clientName = cleanText(invoice.client_name || "");
  const clientCode = cleanText(invoice.client_code || "");
  const clientVatCode = cleanText(invoice.client_vat_code || "");
  const clientAddress = cleanText(invoice.client_address || "");

  const number = cleanText(invoice.number || invoice.id);
  const currency = cleanText(invoice.currency || "EUR");

  const issueDate = invoice.issue_date ? new Date(invoice.issue_date) : null;
  const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;

  const issueDateText = issueDate ? safeLtDateString(issueDate) : "";
  const dueDateText = dueDate ? safeLtDateString(dueDate) : "";

  const qty = Number(invoice.quantity) || 1;
  const unitPrice = Number(invoice.unit_price) || 0;
  const totalNet =
    invoice.total_without_vat != null
      ? Number(invoice.total_without_vat)
      : qty * unitPrice;
  const vatRate = invoice.vat_rate != null ? Number(invoice.vat_rate) : 0;
  const vatAmount =
    invoice.vat_amount != null ? Number(invoice.vat_amount) : 0;
  const totalGross =
    invoice.total_with_vat != null
      ? Number(invoice.total_with_vat)
      : totalNet + vatAmount;

  const paymentTermsDays =
    typeof settings?.default_payment_terms_days === "number"
      ? settings.default_payment_terms_days
      : 14;

  let cursorY = height - margin;

  // ---------- HEADERIS: PARDAVĖJAS + SĄSKAITOS BLOKAS ----------

  // Pardavėjas kairėje
  let sellerY = cursorY;

  page.drawText(sellerName, {
    x: margin,
    y: sellerY,
    size: fontSizeNormal + 2,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  sellerY -= 14;

  const sellerLines = [];
  if (sellerAddress) sellerLines.push(sellerAddress);
  if (sellerCode) sellerLines.push(`IV numeris: ${sellerCode}`);
  if (sellerVat) sellerLines.push(`PVM kodas: ${sellerVat}`);
  // Bankas ir sąskaita – atskiros eilutės
  if (sellerBank) sellerLines.push(`Bankas: ${sellerBank}`);
  if (sellerIban) sellerLines.push(`Sąskaitos nr.: ${sellerIban}`);
  if (sellerEmail) sellerLines.push(`El. paštas: ${sellerEmail}`);
  if (sellerPhone) sellerLines.push(`Tel.: ${sellerPhone}`);

  for (const line of sellerLines) {
    const text = cleanText(line);
    page.drawText(text, {
      x: margin,
      y: sellerY,
      size: fontSizeNormal,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    sellerY -= 12;
  }

  // Dešinėje – „Sąskaita faktūra“ ir numeris
  const titleX = width / 2 + 40;
  let titleY = cursorY + 8;

  page.drawText("Sąskaita faktūra", {
    x: titleX,
    y: titleY,
    size: fontSizeTitle,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.15),
  });

  titleY -= 28;

  // --- NAUJAS NR. IŠDĖSTYMAS VIENOJE EILUTĖJE ---

  const labelNr = "Nr.:";
  const labelNrWidth = fontRegular.widthOfTextAtSize(
    labelNr,
    fontSizeNormal
  );
  const numberWidth = fontBold.widthOfTextAtSize(
    number,
    fontSizeNormal
  );
  const spaceWidth = fontRegular.widthOfTextAtSize(" ", fontSizeNormal);
  const totalWidth = labelNrWidth + spaceWidth + numberWidth;

  // norim, kad visa „Nr.: EV-...“ eilutė būtų sulygiuota prie dešinio krašto
  const rightEdge = width - margin;
  const startX = rightEdge - totalWidth;

  page.drawText(labelNr, {
    x: startX,
    y: titleY,
    size: fontSizeNormal,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(number, {
    x: startX + labelNrWidth + spaceWidth,
    y: titleY,
    size: fontSizeNormal,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.15),
  });

  // Dešinėje – datų blokas, nustumtas iki pat dešinio krašto,
  // kad etiketės ir reikšmės nesusiliptų
  let infoY = titleY - 34;
  const infoXValue = width - margin; // reikšmės ties dešiniu kraštu
  const infoXLabel = infoXValue - 150; // etiketės kairiau, turi ~150px

  const drawInfoRow = (label, value) => {
    if (!value) return;
    const lbl = cleanText(label);
    const val = cleanText(value);

    page.drawText(lbl, {
      x: infoXLabel,
      y: infoY,
      size: fontSizeNormal,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    const valWidth = fontRegular.widthOfTextAtSize(val, fontSizeNormal);
    page.drawText(val, {
      x: infoXValue - valWidth,
      y: infoY,
      size: fontSizeNormal,
      font: fontRegular,
      color: rgb(0.15, 0.15, 0.15),
    });

    infoY -= 12;
  };

  drawInfoRow("Išrašymo data:", issueDateText || "");
  drawInfoRow("Apmokėjimo terminas:", `${paymentTermsDays} d.`);
  drawInfoRow("Apmokėti iki:", dueDateText || "");

  cursorY = sellerY - 24;

  // „Mokėtina suma“ juosta (dešinėje)
  const balanceLabel = "Mokėtina suma:";
  const balanceValue = `${totalGross.toFixed(2)} ${currency}`;

  const barWidth = 260;
  const barHeight = 26;
  const barX = width - margin - barWidth;
  const barY = cursorY - barHeight;

  page.drawRectangle({
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight,
    color: rgb(0.95, 0.95, 0.95),
  });

  let barTextY = barY + 8;

  page.drawText(balanceLabel, {
    x: barX + 14,
    y: barTextY,
    size: fontSizeNormal,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  const balanceWidth = fontBold.widthOfTextAtSize(
    balanceValue,
    fontSizeNormal + 1
  );
  page.drawText(balanceValue, {
    x: barX + barWidth - 14 - balanceWidth,
    y: barTextY,
    size: fontSizeNormal + 1,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  cursorY = barY - 32;

  // ---------- Pirkėjas („Bill To“) ----------

  page.drawText("Pirkėjas:", {
    x: margin,
    y: cursorY,
    size: fontSizeNormal,
    font: fontBold,
    color: rgb(0.3, 0.3, 0.3),
  });

  cursorY -= 14;

  const billLines = [];
  if (clientName) billLines.push(clientName);
  if (clientAddress) billLines.push(clientAddress);
  if (clientCode) billLines.push(`Įmonės kodas: ${clientCode}`);
  if (clientVatCode) billLines.push(`PVM kodas: ${clientVatCode}`);

  for (const line of billLines) {
    const text = cleanText(line);
    page.drawText(text, {
      x: margin,
      y: cursorY,
      size: fontSizeNormal,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    cursorY -= 12;
  }

  // šiek tiek mažesnis tarpas iki lentelės,
  // kad juoda juosta būtų truputį aukščiau
  cursorY -= 14;

  // ---------- LENTELĖ: paslaugos ----------

  const tableLeft = margin;
  const tableRight = width - margin;
  const tableWidth = tableRight - tableLeft;

  const colItemLeft = tableLeft + 8;
  const colQtyCenter = tableLeft + tableWidth * 0.55;
  const colRateCenter = tableLeft + tableWidth * 0.72;
  const colAmtCenter = tableLeft + tableWidth * 0.89;

  const headerHeight = 20;
  const rowHeight = 18;

  // Header fonas – tamsus
  page.drawRectangle({
    x: tableLeft,
    y: cursorY - headerHeight,
    width: tableWidth,
    height: headerHeight,
    color: rgb(0.2, 0.2, 0.2),
  });

  const headerTextY = cursorY - headerHeight + 6;

  const drawHeaderCell = (text, x, align = "left") => {
    const label = cleanText(text);
    const widthLabel = fontBold.widthOfTextAtSize(
      label,
      fontSizeNormal
    );
    let drawX = x;
    if (align === "center") drawX = x - widthLabel / 2;
    if (align === "right") drawX = x - widthLabel;
    page.drawText(label, {
      x: drawX,
      y: headerTextY,
      size: fontSizeNormal,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  };

  // Čia pervadinam į „Paslauga“
  drawHeaderCell("Paslauga", colItemLeft, "left");
  drawHeaderCell("Kiekis", colQtyCenter, "center");
  drawHeaderCell("Kaina", colRateCenter, "center");
  drawHeaderCell("Suma", colAmtCenter, "center");

  // papildomas tarpas, kad žemiau esantis tekstas būtų aiškiai matomas
  cursorY -= headerHeight + 12;

  // Viena paslaugos eilutė
  const desc =
    cleanText(invoice.description) ||
    "Reklamos talpinimas kataloge";

  const qtyText = qty.toFixed(2);
  const rateText = `${unitPrice.toFixed(2)} ${currency}`;
  const amountText = `${totalNet.toFixed(2)} ${currency}`;

  const descY = cursorY;

  page.drawText(desc, {
    x: colItemLeft,
    y: descY,
    size: fontSizeNormal,
    font: fontRegular,
    color: rgb(0.15, 0.15, 0.15),
  });

  const drawCenterText = (text, centerX) => {
    const t = cleanText(text);
    const w = fontRegular.widthOfTextAtSize(t, fontSizeNormal);
    page.drawText(t, {
      x: centerX - w / 2,
      y: descY,
      size: fontSizeNormal,
      font: fontRegular,
      color: rgb(0.15, 0.15, 0.15),
    });
  };

  drawCenterText(qtyText, colQtyCenter);
  drawCenterText(rateText, colRateCenter);
  drawCenterText(amountText, colAmtCenter);

  cursorY -= rowHeight;

  // Linija po lentele
  page.drawLine({
    start: { x: tableLeft, y: cursorY },
    end: { x: tableRight, y: cursorY },
    thickness: 0.8,
    color: rgb(0.9, 0.9, 0.9),
  });

  cursorY -= 24;

  // ---------- SUMOS BLOKAS (dešinėje) ----------

  const sumBoxWidth = 200;
  const sumBoxX = tableRight - sumBoxWidth;
  let sumY = cursorY;

  const drawSumRow = (label, value, bold = false) => {
    const lbl = cleanText(label);
    const val = cleanText(value);
    const font = bold ? fontBold : fontRegular;

    page.drawText(lbl, {
      x: sumBoxX,
      y: sumY,
      size: fontSizeNormal,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });

    const valWidth = font.widthOfTextAtSize(val, fontSizeNormal);
    page.drawText(val, {
      x: sumBoxX + sumBoxWidth - valWidth,
      y: sumY,
      size: fontSizeNormal,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });

    sumY -= 14;
  };

  drawSumRow("Suma be PVM:", `${totalNet.toFixed(2)} ${currency}`, false);
  drawSumRow(
    `PVM (${vatRate.toFixed(0)}%):`,
    `${vatAmount.toFixed(2)} ${currency}`,
    false
  );
  drawSumRow("Iš viso:", `${totalGross.toFixed(2)} ${currency}`, true);

  // Pastaba apačioje kairėje
  const noteText =
    "Pastaba: pardavėjas nėra PVM mokėtojas – PVM tarifas taikomas 0%.";

  page.drawText(noteText, {
    x: margin,
    y: sumY - 20,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * SERVER ACTION:
 * sugeneruoti PDF, įkelti į Supabase Storage ir atnaujinti invoices.pdf_url
 */
export async function generateInvoicePdfAction(formData) {
  "use server";

  const invoiceIdRaw = formData.get("invoiceId");
  const invoiceId = invoiceIdRaw ? invoiceIdRaw.toString().trim() : "";

  if (!invoiceId) {
    console.error("generateInvoicePdfAction: missing invoiceId");
    redirect(
      "/dashboard/invoices?error=pdf_failed&debug=missing_invoice_id"
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await supabaseServer();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (hasError(profileError) || !profile?.is_admin) {
    console.error(
      "generateInvoicePdfAction profile ERROR:",
      profileError
    );
    redirect(
      `/dashboard/invoices/${invoiceId}?error=pdf_failed&debug=profile_check`
    );
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .maybeSingle();

  if (hasError(invoiceError) || !invoice) {
    console.error(
      "generateInvoicePdfAction invoice ERROR:",
      invoiceError
    );
    redirect(
      `/dashboard/invoices/${invoiceId}?error=pdf_failed&debug=invoice_fetch`
    );
  }

  const { data: settings, error: settingsError } = await supabase
    .from("invoice_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (hasError(settingsError)) {
    console.error(
      "generateInvoicePdfAction invoice_settings ERROR:",
      settingsError
    );
  }

  let pdfBytes;
  try {
    pdfBytes = await generateInvoicePdfBytes(invoice, settings);
  } catch (pdfErr) {
    console.error(
      "generateInvoicePdfAction PDF GENERATION ERROR:",
      pdfErr
    );
    redirect(
      `/dashboard/invoices/${invoiceId}?error=pdf_failed&debug=pdf_generation`
    );
  }

  const pdfBuffer = Buffer.from(pdfBytes);
  const admin = supabaseAdmin();

  const safeNumber = invoice.number || `inv-${invoice.id}`;
  const fileName = `${safeNumber}.pdf`;
  const storagePath = fileName;

  const { data: uploadData, error: uploadError } = await admin.storage
    .from("invoice-pdfs")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (hasError(uploadError) || !uploadData) {
    console.error(
      "generateInvoicePdfAction upload ERROR:",
      uploadError
    );

    let detail = "unknown";
    try {
      const code = uploadError?.statusCode || uploadError?.error || "";
      const msg = uploadError?.message || uploadError?.name || "";
      const compact = `${code}:${msg}` || JSON.stringify(uploadError);
      detail = encodeURIComponent(compact.slice(0, 180));
    } catch {
      // ignore
    }

    redirect(
      `/dashboard/invoices/${invoiceId}?error=pdf_failed&debug=upload_error&detail=${detail}`
    );
  }

  const { data: publicData } = admin.storage
    .from("invoice-pdfs")
    .getPublicUrl(storagePath);

  const publicUrl = publicData?.publicUrl || null;

  const { error: updateError } = await admin
    .from("invoices")
    .update({
      pdf_url: publicUrl,
      status: invoice.status || "issued",
    })
    .eq("id", invoiceId);

  if (hasError(updateError)) {
    console.error(
      "generateInvoicePdfAction update invoice ERROR:",
      updateError
    );
    redirect(
      `/dashboard/invoices/${invoiceId}?error=pdf_failed&debug=invoice_update`
    );
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${invoiceId}`);

  redirect(`/dashboard/invoices/${invoiceId}?success=pdf_generated`);
}
