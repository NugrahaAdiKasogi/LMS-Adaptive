// --- Penjelasan: Impor library ---
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAuth } from "../hooks/useAuth";

// --- Penjelasan: Impor komponen UI kustom kita ---
import { Spinner } from "../components/ui/Etc";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";

// --- Penjelasan: Impor ikon ---
import { HiArrowLeft, HiOutlineLogout } from "react-icons/hi";

export default function ProgressPage() {
  // --- Penjelasan: State Management ---
  const [progress, setProgress] = useState([]); // Menyimpan rangkuman progres
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Penjelasan: Ambil data user & navigasi ---
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- Penjelasan: Fungsi Logout (Sama seperti MateriPage) ---
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  // --- Penjelasan: useEffect untuk Mengambil Data Progres ---
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return; // Pastikan user sudah ada

      try {
        setLoading(true);
        setError(null);

        // --- Penjelasan: Kueri Kunci (Join Tabel) ---
        // Kita mengambil data dari tabel 'progress'
        // '*, materials(title)' artinya:
        // "Ambil SEMUA kolom dari 'progress', DAN dari tabel 'materials'
        // yang terhubung, ambil HANYA kolom 'title'-nya."
        const { data, error } = await supabase
          .from("progress")
          .select(
            "score, status, attempts, materials:materials!fk_progress_material ( title )"
          )
          .eq("user_id", user.id) // Hanya untuk user yang login
          .order("material_id", { ascending: true }); // Urutkan

        if (error) throw error;

        // Data yang didapat akan seperti:
        // [ { score: 80, status: 'lulus', attempts: 1, materials: { title: 'Materi 1' } }, ... ]
        setProgress(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]); // Jalankan saat user sudah siap

  // --- Tampilan 1: Loading ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <Spinner />
        <span className="mt-4 text-lg text-gray-700">Memuat progres...</span>
      </div>
    );
  }

  // --- Tampilan 2: Error ---
  if (error) {
    return (
      <div className="container p-4 mx-auto mt-10">
        <Alert color="failure">
          <span className="font-medium">Error!</span> {error}
        </Alert>
      </div>
    );
  }

  // --- Tampilan 3: Halaman Utama ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">INQURA</h1>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-600 sm:block">
            {user.email}
          </span>
          <Button color="light" onClick={handleLogout} className="text-sm">
            <HiOutlineLogout className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Konten Utama */}
      <main className="container p-4 mx-auto mt-8 max-w-4xl">
        <Button
          color="light"
          onClick={() => navigate("/materi")}
          className="mb-6"
        >
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Dashboard
        </Button>

        <h2 className="mb-6 text-3xl font-semibold text-gray-800">
          Dashboard Progres
        </h2>

        {/* Cek jika belum ada progres */}
        {progress.length === 0 ? (
          <Alert color="warning">Anda belum menyelesaikan materi apapun.</Alert>
        ) : (
          // Jika ada progres, tampilkan sebagai tabel
          <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Materi
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Skor
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Percobaan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progress.map((item) => (
                  <tr key={item.materials.title}>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {item.materials.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* --- Penjelasan: Tampilan Status dengan Warna --- */}
                      {item.status === "lulus" ? (
                        <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                          Lulus
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full">
                          Mengulang
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {item.score}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {item.attempts} kali
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
