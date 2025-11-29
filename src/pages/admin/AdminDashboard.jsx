// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p>Hanya admin yang bisa melihat halaman ini.</p>
      <div className="mt-4 flex gap-4">
        <Button color="blue" onClick={() => navigate("/admin/materi")}>
          Kelola Materi
        </Button>
        <Button color="blue" onClick={() => navigate("/admin/soal")}>
          Kelola Soal
        </Button>
        <Button color="light" onClick={logout}>
          Logout Admin
        </Button>
      </div>
      <div className="p-6 border rounded-lg bg-green-50 py-4 mt-6">
        <h3 className="font-bold text-lg mb-2">Rekap Nilai</h3>
        <p className="text-sm text-gray-600 mb-4">
          Lihat riwayat pengerjaan siswa.
        </p>
        <Button
          color="success"
          className="w-full"
          onClick={() => navigate("/admin/recap")}
        >
          Lihat Rekap
        </Button>
      </div>
    </div>
  );
}