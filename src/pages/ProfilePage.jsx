import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import {
  HiArrowLeft,
  HiOutlineLogout,
  HiOutlineChartBar,
} from "react-icons/hi";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login"); // Arahkan ke login setelah logout
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">Memuat...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar Sederhana */}
      <nav className="flex items-center justify-between p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">INQURA</h1>
        <Button color="light" onClick={() => navigate("/materi")}>
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Materi
        </Button>
      </nav>

      {/* Konten Utama */}
      <main className="container p-4 mx-auto mt-8 max-w-lg">
        <div className="p-8 bg-white rounded-lg shadow-md border">
          <h2 className="mb-6 text-3xl font-semibold text-center text-gray-800">
            Profil Saya
          </h2>

          {/* Info Pengguna */}
          <div className="p-4 mb-6 bg-gray-50 rounded-md border">
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg font-semibold text-gray-900">{user.email}</p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col gap-4">
            {/* INI TOMBOL BARU ANDA */}
            <Button
              color="blue"
              onClick={() => navigate("/progress")}
              className="w-full justify-center text-base"
            >
              <HiOutlineChartBar className="w-5 h-5 mr-2" />
              Lihat Rangkuman Progres
            </Button>

            <Button
              color="light"
              onClick={handleLogout}
              className="w-full justify-center text-base"
            >
              <HiOutlineLogout className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
