import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";

// Impor Komponen UI
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import { Spinner } from "../components/ui/Etc";
import { HiUserCircle, HiTrash, HiRefresh } from "react-icons/hi";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ completed: 0, totalScore: 0 });
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false); // State untuk loading tombol reset

  // Fetch data statistik siswa
  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);

    // Hitung materi yang "lulus"
    const { data: progressData } = await supabase
      .from("progress")
      .select("score, status")
      .eq("user_id", user.id);

    if (progressData) {
      const completed = progressData.filter((p) => p.status === "lulus").length;
      const totalScore = progressData.reduce(
        (acc, curr) => acc + (curr.score || 0),
        0
      );
      const avgScore =
        progressData.length > 0
          ? Math.round(totalScore / progressData.length)
          : 0;

      setStats({ completed, avgScore });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // --- FITUR RESET UNTUK TESTING ---
  const handleResetProgress = async () => {
    const confirm = window.confirm(
      "⚠️ PERINGATAN TESTING ⚠️\n\nApakah Anda yakin ingin mereset semua progress?\nStatus Anda akan kembali seperti MURID BARU (Level Hard)."
    );

    if (!confirm) return;

    try {
      setResetLoading(true);

      // 1. Hapus data Progress (Status Lulus/Mengulang & Attempts)
      const { error: errProgress } = await supabase
        .from("progress")
        .delete()
        .eq("user_id", user.id);

      if (errProgress) throw errProgress;

      // 2. Hapus data History (Riwayat Percobaan)
      const { error: errHistory } = await supabase
        .from("attempt_history")
        .delete()
        .eq("user_id", user.id);

      if (errHistory) throw errHistory;

      alert("Data berhasil di-reset! Anda sekarang adalah 'Murid Baru'.");

      // Refresh halaman/data
      fetchStats();
      navigate("/materi"); // Lempar balik ke dashboard materi
    } catch (error) {
      alert("Gagal reset: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center mt-10">
        <Spinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Profil */}
        <div className="flex items-center gap-4 mb-8">
          <HiUserCircle className="w-16 h-16 text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Profil Siswa</h1>
            <p className="text-gray-600">{user?.email}</p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
              Role: {user?.app_metadata?.role || "Student"}
            </span>
          </div>
        </div>

        {/* Statistik Belajar */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center bg-blue-50 border-blue-100">
            <h3 className="text-3xl font-bold text-blue-600">
              {stats.completed}
            </h3>
            <p className="text-sm text-gray-600">Materi Lulus</p>
          </Card>
          <Card className="text-center bg-green-50 border-green-100">
            <h3 className="text-3xl font-bold text-green-600">
              {stats.avgScore || 0}
            </h3>
            <p className="text-sm text-gray-600">Rata-rata Nilai</p>
          </Card>
        </div>

        {/* Tombol Logout */}
        <Card>
          <h3 className="font-bold text-gray-800 mb-4">Pengaturan Akun</h3>
          <Button
            color="light"
            onClick={logout}
            className="w-full justify-center"
          >
            Logout
          </Button>
        </Card>

        {/* --- ZONE TESTING (RESET BUTTON) --- */}
        <div className="mt-8 border-t-2 border-dashed border-red-200 pt-6">
          <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
            <h3 className="font-bold text-red-800 mb-2 flex items-center justify-center gap-2">
              <HiRefresh className="w-5 h-5" /> Zone Testing / Debugging
            </h3>
            <p className="text-sm text-red-600 mb-4">
              Gunakan tombol ini untuk menghapus semua nilai & riwayat Anda.
              Sistem akan menganggap Anda belum pernah mengerjakan apapun
              (Attempt 0).
            </p>

            <Button
              color="failure"
              onClick={handleResetProgress}
              disabled={resetLoading}
              className="w-full justify-center shadow-red-200"
            >
              {resetLoading ? (
                <Spinner />
              ) : (
                <>
                  <HiTrash className="w-5 h-5 mr-2" />
                  Reset Progress Saya (Mulai dari Awal)
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
