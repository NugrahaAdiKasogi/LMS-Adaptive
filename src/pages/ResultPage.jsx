import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function ResultPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  if (!state)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p className="mb-4 text-lg text-gray-700">
          Tidak ada data hasil ditemukan.
        </p>
        <Button color="blue" onClick={() => navigate("/materi")}>
          Kembali
        </Button>
      </div>
    );

  const { score, status, correctCount, totalCount } = state;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="p-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-blue-600">Hasil Latihan</h1>

        <p className="text-xl font-semibold">Skor Kamu</p>
        <p className="text-6xl font-extrabold text-blue-700">{score}</p>

        <p
          className={`mt-4 text-2xl font-bold ${
            status === "lulus" ? "text-green-600" : "text-yellow-600"
          }`}
        >
          {status === "lulus" ? "Lulus 🎉" : "Mengulang 🔄"}
        </p>

        <p className="mt-2 text-gray-600">
          Benar {correctCount} dari {totalCount} soal
        </p>

        <div className="mt-8 flex gap-4 justify-center">
          {/* --- INI ADALAH LOGIKA KUNCI ---
            Kita cek 'status' yang kita dapat dari LatihanPage.
          */}
                   {" "}
          {status === "lulus" ? (
            // Jika LULUS, tombol ini akan kembali ke /materi (Dashboard)
            <Button color="blue" onClick={() => navigate("/materi")}>
                            Lanjut ke Dashboard            {" "}
            </Button>
          ) : (
            // Jika MENGULANG, tombol ini akan kembali ke halaman materi
            // (misal: /materi/1) di mana materi_rinci akan tampil.
            <Button color="gray" onClick={() => navigate(`/materi/${id}`)}>
                            Ulangi Materi            {" "}
            </Button>
          )}
                 {" "}
        </div>
      </Card>
    </div>
  );
}
