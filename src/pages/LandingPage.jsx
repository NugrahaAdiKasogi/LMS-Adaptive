import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-teal-400 to-blue-500 text-white px-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Selamat Datang di Media Pembelajaran Interaktif
      </h1>
      <p className="text-lg md:text-xl max-w-lg mb-8">
        Pelajari HTML, CSS, dan JavaScript secara bertahap dengan sistem latihan adaptif.
      </p>

      <div className="flex gap-4">
        <button
          className="bg-white text-blue-500 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition"
          onClick={() => navigate('/login')}
        >
          Sudah Punya Akun
        </button>
        <button
          className="border-2 border-white text-white py-3 px-6 rounded-lg hover:bg-white hover:text-blue-500 transition"
          onClick={() => navigate('/register')}
        >
          Belum Punya Akun
        </button>
      </div>
    </div>
  )
}
