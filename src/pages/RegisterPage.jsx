import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth' // <-- Gunakan hook Anda

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register } = useAuth() // <-- Ambil fungsi register dari hook

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Panggil fungsi register dari hook
      await register(email, password)
      alert('Registrasi berhasil! Silakan login.')
      navigate('/login') // Arahkan ke login setelah sukses
    } catch (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Buat Akun Baru
        </h2>
        
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input 
              id="email"
              type="email" 
              placeholder="emailanda@contoh.com" 
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input 
              id="password"
              type="password" 
              placeholder="Minimal 6 karakter" 
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  )
}