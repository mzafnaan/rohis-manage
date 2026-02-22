import { InfakSession } from "@/types/finance";
import { formatDateIndo, formatRupiah } from "../../_utils";

interface LaporanInfakContentProps {
  session: InfakSession;
}

export default function LaporanInfakContent({
  session,
}: LaporanInfakContentProps) {
  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        color: "#1a1a1a",
        lineHeight: 1.6,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: "bold",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Rohis SMA
        </h1>
        <hr
          style={{
            border: "none",
            borderTop: "2px solid #1a1a1a",
            margin: "8px 0",
          }}
        />
        <h2
          style={{
            fontSize: 16,
            fontWeight: "bold",
            margin: "12px 0 4px",
            textTransform: "uppercase",
          }}
        >
          Laporan Infak
        </h2>
      </div>

      {/* Info Kegiatan */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 6,
          padding: "14px 18px",
          marginBottom: 24,
        }}
      >
        <table style={{ fontSize: 12 }}>
          <tbody>
            <tr>
              <td
                style={{
                  padding: "3px 0",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                Nama Kegiatan
              </td>
              <td style={{ padding: "3px 8px" }}>:</td>
              <td style={{ padding: "3px 0" }}>{session.title}</td>
            </tr>
            <tr>
              <td style={{ padding: "3px 0", fontWeight: "bold" }}>Tanggal</td>
              <td style={{ padding: "3px 8px" }}>:</td>
              <td style={{ padding: "3px 0" }}>
                {formatDateIndo(session.date)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "3px 0", fontWeight: "bold" }}>Status</td>
              <td style={{ padding: "3px 8px" }}>:</td>
              <td style={{ padding: "3px 0" }}>
                {session.status === "completed" ? "Selesai" : "Draft"}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "3px 0", fontWeight: "bold" }}>
                Total Infak Terkumpul
              </td>
              <td style={{ padding: "3px 8px" }}>:</td>
              <td
                style={{
                  padding: "3px 0",
                  fontWeight: "bold",
                  color: "#16a34a",
                  fontSize: 14,
                }}
              >
                {formatRupiah(session.total || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabel Rincian per Kelas */}
      {session.classes && session.classes.length > 0 && (
        <>
          <h3
            style={{
              fontSize: 13,
              fontWeight: "bold",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Rincian Infak per Kelas
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 11,
              minWidth: 400,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "6px 10px",
                    textAlign: "center",
                    fontWeight: "bold",
                    width: 50,
                  }}
                >
                  No
                </th>
                <th
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "6px 10px",
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  Kelas
                </th>
                <th
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "6px 10px",
                    textAlign: "right",
                    fontWeight: "bold",
                    width: 140,
                  }}
                >
                  Jumlah Infak
                </th>
              </tr>
            </thead>
            <tbody>
              {session.classes.map((cls, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "5px 10px",
                      textAlign: "center",
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "5px 10px",
                    }}
                  >
                    {cls.className || "-"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "5px 10px",
                      textAlign: "right",
                    }}
                  >
                    {formatRupiah(Number(cls.amount) || 0)}
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr style={{ backgroundColor: "#f9fafb", fontWeight: "bold" }}>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "6px 10px",
                    textAlign: "right",
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "6px 10px",
                    textAlign: "right",
                    color: "#16a34a",
                  }}
                >
                  {formatRupiah(session.total || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {/* Tanda Tangan */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 36,
          paddingTop: 16,
        }}
      >
        <div style={{ textAlign: "center", width: "40%" }}>
          <p style={{ fontSize: 11, margin: 0, color: "#555" }}>Dibuat oleh,</p>
          <p
            style={{
              fontSize: 12,
              fontWeight: "bold",
              margin: "2px 0 60px",
            }}
          >
            Bendahara
          </p>
          <div
            style={{
              borderTop: "1px solid #333",
              display: "inline-block",
              minWidth: 150,
              paddingTop: 4,
            }}
          >
            <p style={{ fontSize: 11, margin: 0 }}>(___________________)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
