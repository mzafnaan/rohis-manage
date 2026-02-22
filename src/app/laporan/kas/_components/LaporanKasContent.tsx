import { Transaction } from "@/types/finance";
import { MONTHS } from "../../_constants";
import { formatDateIndo, formatRupiah } from "../../_utils";

interface LaporanKasContentProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  saldoAkhir: number;
  bulan: number;
  tahun: number;
}

export default function LaporanKasContent({
  transactions,
  totalIncome,
  totalExpense,
  saldoAkhir,
  bulan,
  tahun,
}: LaporanKasContentProps) {
  const periodLabel = `${MONTHS[bulan - 1]} ${tahun}`;
  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Calculate running balance per transaction using reduce (no reassignment)
  const transactionsWithBalance = transactions.reduce<
    (Transaction & { saldo: number })[]
  >((acc, t) => {
    const prevSaldo = acc.length > 0 ? acc[acc.length - 1].saldo : 0;
    const saldo =
      t.type === "income" ? prevSaldo + t.amount : prevSaldo - t.amount;
    return [...acc, { ...t, saldo }];
  }, []);

  const thStyle: React.CSSProperties = {
    borderTop: "2px solid #222",
    borderBottom: "2px solid #222",
    padding: "6px 8px",
    fontWeight: "bold",
    fontSize: 11,
  };

  const tdStyle: React.CSSProperties = {
    borderBottom: "1px solid #ddd",
    padding: "5px 8px",
    fontSize: 11,
  };

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        color: "#111",
        lineHeight: 1.6,
        fontSize: 12,
      }}
    >
      {/* ===== KOP SURAT ===== */}
      <div
        style={{
          textAlign: "center",
          paddingBottom: 10,
          borderBottom: "3px double #111",
          marginBottom: 18,
        }}
      >
        <h1
          style={{
            fontSize: 17,
            fontWeight: "bold",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Organisasi Rohani Islam (ROHIS)
        </h1>
        <p style={{ fontSize: 13, margin: "2px 0 0", fontWeight: "bold" }}>
          SMA Negeri / Swasta
        </p>
        <p style={{ fontSize: 10, margin: "2px 0 0", color: "#444" }}>
          Jl. Alamat Sekolah, Kota, Provinsi
        </p>
      </div>

      {/* ===== JUDUL LAPORAN ===== */}
      <div style={{ textAlign: "center", margin: "18px 0 16px" }}>
        <h2
          style={{
            fontSize: 14,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 1.5,
            margin: 0,
            textDecoration: "underline",
            textUnderlineOffset: 4,
          }}
        >
          Laporan Keuangan Kas Organisasi
        </h2>
        <p style={{ fontSize: 12, margin: "4px 0 0", color: "#333" }}>
          Periode: {periodLabel}
        </p>
      </div>

      {/* ===== RINGKASAN KEUANGAN ===== */}
      <div style={{ margin: "16px 0 20px" }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 6,
          }}
        >
          Ringkasan Keuangan:
        </p>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: "5px 0",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Total Pemasukan
              </td>
              <td
                style={{
                  padding: "5px 0",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {formatRupiah(totalIncome)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "5px 0",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Total Pengeluaran
              </td>
              <td
                style={{
                  padding: "5px 0",
                  textAlign: "right",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {formatRupiah(totalExpense)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "6px 0 5px",
                  fontWeight: "bold",
                  fontSize: 13,
                  borderTop: "2px solid #333",
                  borderBottom: "2px solid #333",
                }}
              >
                Saldo Akhir
              </td>
              <td
                style={{
                  padding: "6px 0 5px",
                  textAlign: "right",
                  fontWeight: "bold",
                  fontSize: 13,
                  borderTop: "2px solid #333",
                  borderBottom: "2px solid #333",
                }}
              >
                {formatRupiah(saldoAkhir)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ===== TABEL RINCIAN TRANSAKSI ===== */}
      <div style={{ margin: "0 0 20px" }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 6,
          }}
        >
          Rincian Transaksi:
        </p>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 550,
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: "center", width: 35 }}>No</th>
              <th style={{ ...thStyle, textAlign: "left", width: 90 }}>
                Tanggal
              </th>
              <th style={{ ...thStyle, textAlign: "left" }}>Keterangan</th>
              <th style={{ ...thStyle, textAlign: "center", width: 55 }}>
                Jenis
              </th>
              <th style={{ ...thStyle, textAlign: "right", width: 110 }}>
                Nominal
              </th>
              <th style={{ ...thStyle, textAlign: "right", width: 110 }}>
                Saldo
              </th>
            </tr>
          </thead>
          <tbody>
            {transactionsWithBalance.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "16px 8px",
                    textAlign: "center",
                    borderBottom: "1px solid #ccc",
                    fontStyle: "italic",
                    color: "#555",
                    fontSize: 12,
                  }}
                >
                  Tidak terdapat transaksi pada periode ini.
                </td>
              </tr>
            ) : (
              transactionsWithBalance.map((t, idx) => (
                <tr key={t.id}>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{idx + 1}</td>
                  <td style={tdStyle}>{formatDateIndo(t.date)}</td>
                  <td style={tdStyle}>{t.description}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {t.type === "income" ? "Masuk" : "Keluar"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {formatRupiah(t.amount)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {formatRupiah(t.saldo)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {transactionsWithBalance.length > 0 && (
            <tfoot>
              <tr>
                <td
                  colSpan={4}
                  style={{
                    borderTop: "2px solid #222",
                    padding: "6px 8px",
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: 11,
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    borderTop: "2px solid #222",
                    padding: "6px 8px",
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: 11,
                  }}
                >
                  {formatRupiah(totalIncome + totalExpense)}
                </td>
                <td
                  style={{
                    borderTop: "2px solid #222",
                    padding: "6px 8px",
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: 11,
                  }}
                >
                  {formatRupiah(saldoAkhir)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ===== TANDA TANGAN ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 40,
        }}
      >
        <div style={{ textAlign: "center", width: "45%" }}>
          <p style={{ fontSize: 11, margin: 0 }}>Mengetahui,</p>
          <p
            style={{
              fontSize: 12,
              fontWeight: "bold",
              margin: "2px 0 0",
            }}
          >
            Ketua Rohis
          </p>
          <div style={{ height: 70 }} />
          <div
            style={{
              borderBottom: "1px solid #111",
              width: "70%",
              margin: "0 auto",
            }}
          />
          <p
            style={{
              fontSize: 11,
              margin: "4px 0 0",
              fontWeight: "bold",
            }}
          >
            ___________________
          </p>
        </div>

        <div style={{ textAlign: "center", width: "45%" }}>
          <p style={{ fontSize: 11, margin: 0 }}>Dibuat oleh,</p>
          <p
            style={{
              fontSize: 12,
              fontWeight: "bold",
              margin: "2px 0 0",
            }}
          >
            Bendahara
          </p>
          <div style={{ height: 70 }} />
          <div
            style={{
              borderBottom: "1px solid #111",
              width: "70%",
              margin: "0 auto",
            }}
          />
          <p
            style={{
              fontSize: 11,
              margin: "4px 0 0",
              fontWeight: "bold",
            }}
          >
            ___________________
          </p>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div
        style={{
          marginTop: 32,
          paddingTop: 8,
          borderTop: "1px solid #ddd",
          textAlign: "center",
          fontSize: 9,
          color: "#888",
        }}
      >
        <p style={{ margin: 0 }}>Laporan ini dicetak pada: {printDate}</p>
        <p style={{ margin: "2px 0 0" }}>Dicetak melalui sistem Rohis Manage</p>
      </div>
    </div>
  );
}
