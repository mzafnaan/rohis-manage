import type { Timestamp } from "firebase/firestore";
import { MONTHS, PDF_OPTIONS } from "./_constants";

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(timestamp: Timestamp): string {
  if (!timestamp) return "-";
  try {
    const date = timestamp.toDate();
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "-";
  }
}

export function getMonthName(month: number): string {
  return MONTHS[month - 1] || "";
}

export async function generatePDF(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdfModule = await import("html2pdf.js" as any);
  const html2pdf = html2pdfModule.default || html2pdfModule;

  const opt = {
    margin: 10,
    filename,
    image: PDF_OPTIONS.image,
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 800,
      // Remove external stylesheets to avoid "lab()" color parsing errors
      // from Tailwind CSS v4. Report content uses inline styles only.
      onclone: (clonedDoc: Document) => {
        const sheets = clonedDoc.querySelectorAll(
          'style, link[rel="stylesheet"]',
        );
        sheets.forEach((s) => s.remove());
      },
    },
    jsPDF: PDF_OPTIONS.jsPDF,
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  await html2pdf().set(opt).from(element).save();
}
