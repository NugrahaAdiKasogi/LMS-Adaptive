import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    // Tampilkan loading spinner sementara mengecek sesi
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  if (!user) {
    // Jika tidak ada user (belum login), tendang ke halaman login
    return <Navigate to="/login" replace />
  }

  // Jika ada user (sudah login), tampilkan halaman yang diminta
  return <Outlet />
}