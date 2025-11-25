import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from './ui/Etc'; // Pastikan path ini benar sesuai struktur folder Anda

export default function AdminRoute() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  // 1. Jika belum login, lempar ke login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Jika login tapi BUKAN admin, lempar ke dashboard materi (halaman siswa)
  if (role !== 'admin') {
    return <Navigate to="/materi" replace />;
  }

  // 3. Jika admin, silakan masuk
  return <Outlet />;
}