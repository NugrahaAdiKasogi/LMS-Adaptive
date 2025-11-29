import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import MateriPage from './pages/MateriPage'
import LatihanPage from './pages/LatihanPage'
import ResultPage from './pages/ResultPage'
import ProgressPage from './pages/ProgressPage'
import MateriDetailPage from './pages/MateriDetailPage' 
import ProtectedRoute from './components/ProtectedRoute'
import ProfilePage from './pages/ProfilePage' // <-- Impor halaman baru
import AdminRoute from './components/AdminRoute'; // <-- Impor penjaga admin
import AdminDashboard from './pages/admin/AdminDashboard'; // <-- Impor halaman admin
import ManageMateriPage from './pages/admin/ManageMateri'; // <-- Impor halaman kelola materi admin
import ManageSoalPage from './pages/admin/ManageSoal'; // <-- Impor halaman kelola soal admin
import RecapNilai from './pages/admin/RacapNilai'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rute Siswa Terlindungi */}
        <Route element={<ProtectedRoute />}>
          <Route path="/materi" element={<MateriPage />} />
          <Route path="/materi/:id" element={<MateriDetailPage />} />
          <Route path="/latihan/:id" element={<LatihanPage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />{" "}
        </Route>

        {/* Rute Admin (Dilindungi Admin) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/materi" element={<ManageMateriPage />} />
          <Route path="/admin/soal" element={<ManageSoalPage />} />
          <Route path="/admin/recap" element={<RecapNilai/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
