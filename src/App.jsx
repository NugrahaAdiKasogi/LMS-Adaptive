import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import MateriPage from './pages/MateriPage'
import LatihanPage from './pages/LatihanPage'
import ResultPage from './pages/ResultPage'
import ProgressPage from './pages/ProgressPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/materi" element={<MateriPage />} />
        <Route path="/materi/:id" element={<LatihanPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Routes>
    </BrowserRouter>
  )
}
