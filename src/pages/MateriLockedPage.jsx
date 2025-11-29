import { Link } from "react-router-dom";

export default function MateriLockedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600">Materi Terkunci 🔒</h1>
      <p className="mt-4 text-gray-700">
        Selesaikan materi sebelumnya terlebih dahulu untuk membuka materi ini.
      </p>
      <Link
        to="/materi"
        className="px-4 py-2 mt-6 text-white bg-blue-600 rounded-lg"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
