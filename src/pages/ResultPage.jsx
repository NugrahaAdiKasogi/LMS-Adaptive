import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import {
  HiCheckCircle,
  HiXCircle,
  HiArrowRight,
  HiRefresh,
} from "react-icons/hi";

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  if (!state)
    return <div className="p-10 text-center">Data hasil tidak ditemukan.</div>;

  const { score, status, levelPassed, currentLevel } = state;
  const isMaterLulus = status === "lulus"; // Lulus Materi (Hard Passed)

  // Tentukan Pesan Berdasarkan Logika Tangga
  let messageTitle = "";
  let messageDesc = "";
  let buttonText = "";
  let buttonAction = null;

  if (isMaterLulus) {
    // KASUS: Lulus Hard
    messageTitle = "Selamat! Materi Selesai";
    messageDesc =
      "Anda telah menaklukkan level Hard. Materi selanjutnya telah terbuka.";
    buttonText = "Kembali ke Dashboard";
    buttonAction = () => navigate("/materi");
  } else if (levelPassed) {
    // KASUS: Lulus Medium/Easy (Naik Level)
    messageTitle = "Level Tuntas! Naik Tingkat 🚀";
    messageDesc = `Hebat! Nilai Anda ${score}. Karena Anda berhasil di level ${currentLevel}, sekarang tantangan akan ditingkatkan kembali.`;
    buttonText = "Lanjut ke Level Berikutnya";
    buttonAction = () => navigate(`/materi/${id}`); // Balik ke materi untuk reload level baru
  } else {
    // KASUS: Gagal (Turun Level / Tetap)
    messageTitle = "Belum Lulus KKM";
    messageDesc = `Nilai Anda ${score}. Jangan menyerah! Kami akan menyesuaikan materi dan soal agar lebih mudah dipahami.`;
    buttonText = "Coba Lagi (Remedial)";
    buttonAction = () => navigate(`/materi/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8">
        {levelPassed ? (
          <HiCheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
        ) : (
          <HiXCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {messageTitle}
        </h1>
        <p className="text-gray-600 mb-6">{messageDesc}</p>

        <div className="bg-gray-50 p-4 rounded-lg mb-8 border">
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            Skor Akhir
          </p>
          <p
            className={`text-4xl font-bold ${
              levelPassed ? "text-green-600" : "text-red-600"
            }`}
          >
            {score}
          </p>
          <p className="text-xs text-gray-400 mt-1">Level: {currentLevel}</p>
        </div>

        <Button
          color={isMaterLulus ? "success" : "blue"}
          className="w-full justify-center text-lg py-3"
          onClick={buttonAction}
        >
          {buttonText}
          {isMaterLulus ? (
            <HiArrowRight className="ml-2" />
          ) : (
            <HiRefresh className="ml-2" />
          )}
        </Button>
      </Card>
    </div>
  );
}
