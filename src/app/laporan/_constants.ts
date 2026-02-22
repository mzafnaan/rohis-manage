export const allowedRoles = ["bendahara", "ketua", "admin", "sekretaris"];

export const ORG_NAME = "Rohis SMA";

export const PDF_OPTIONS = {
  margin: 10,
  filename: "laporan.pdf",
  image: { type: "jpeg" as const, quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
};

export const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
