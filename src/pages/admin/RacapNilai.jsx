import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { HiArrowLeft } from "react-icons/hi";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Etc";

export default function RecapNilai() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      // Ambil data history DAN judul materi
      const { data, error } = await supabase
        .from("attempt_history")
        .select("*, materials(title)")
        .order("created_at", { ascending: false }); // Yang terbaru paling atas

      if (error) {
        alert("Error: " + error.message);
      } else {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button color="light" onClick={() => navigate("/admin/")}>
            <HiArrowLeft className="w-5 h-5 mr-2" /> Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            Rekap Nilai Siswa
          </h1>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b">
                  <tr>
                    <th className="px-6 py-3">Waktu</th>
                    <th className="px-6 py-3">Email Siswa</th>
                    <th className="px-6 py-3">Materi</th>
                    <th className="px-6 py-3">Skor</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(item.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.user_email}
                      </td>
                      <td className="px-6 py-4">
                        {item.materials?.title || "Materi Dihapus"}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {item.score}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.status === "lulus"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && (
                <p className="text-center p-8 text-gray-500">
                  Belum ada data riwayat latihan.
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
