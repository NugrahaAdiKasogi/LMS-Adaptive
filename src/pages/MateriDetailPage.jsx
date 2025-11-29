import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAuth } from "../hooks/useAuth";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import Button from "../components/ui/Button"; // Gunakan komponen Button Anda
import Card from "../components/ui/Card"; // Gunakan komponen Card Anda
import { Spinner } from "../components/ui/Etc"; // Gunakan komponen Spinner Anda

export default function MateriDetailPage() {
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterialDetail = async () => {
      if (!user || !id) return;

      // --- CEK AKSES (ANTI-BYPASS) ---
      const { data: allMaterials } = await supabase
        .from("materials")
        .select("id")
        .order("id", { ascending: true });

      if (!allMaterials) {
        setLoading(false);
        return;
      }

      const currentId = Number(id);
      const index = allMaterials.findIndex((m) => m.id === currentId);

      // Materi pertama → selalu boleh
      if (index > 0) {
        const prevMaterialId = allMaterials[index - 1].id;

        const { data: prevProgress } = await supabase
          .from("progress")
          .select("status")
          .eq("user_id", user.id)
          .eq("material_id", prevMaterialId)
          .single();

        // Jika materi sebelumnya belum lulus → redirect ke halaman locked
        if (!prevProgress || prevProgress.status !== "lulus") {
          navigate("/materi-locked", { replace: true });
          return;
        }
      }

      setLoading(true);

      // 1. Ambil progres siswa untuk materi ini
      const { data: progressData } = await supabase
        .from("progress")
        .select("status")
        .eq("user_id", user.id)
        .eq("material_id", id)
        .single();

      // 2. Ambil detail materi (reguler DAN rinci)
      const { data: materialData, error } = await supabase
        .from("materials")
        .select("id, title, materi_reguler, materi_rinci")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        // --- INI LOGIKA KUNCI ANDA ---
        // Cek apakah statusnya 'mengulang'
        if (progressData?.status === "mengulang") {
          // Jika ya, buat konten baru dengan materi rinci
          setMaterial({
            id: materialData.id,
            title: materialData.title,
            content: materialData.materi_rinci, // Ambil materi rinci
            isRemedial: true,
          });
        } else {
          // Jika tidak (baru atau lulus), pakai materi reguler
          setMaterial({
            id: materialData.id,
            title: materialData.title,
            content: materialData.materi_reguler, // Ambil materi reguler
            isRemedial: false,
          });
        }
      }
      setLoading(false);
    };

    fetchMaterialDetail();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
        <p className="mt-4">Memuat materi...</p>
      </div>
    );
  }

  if (!material) {
    return <div>Materi tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-white shadow">
        <Button color="light" onClick={() => navigate("/materi")}>
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Dashboard
        </Button>
        <h1 className="text-xl font-bold text-blue-600">{material.title}</h1>
      </nav>

      <main className="max-w-3xl p-4 mx-auto mt-8">
        <Card>
          {material.isRemedial && (
            <div className="p-4 mb-4 text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg">
              <strong>Mode Remedial:</strong> Anda sedang melihat materi yang
              lebih rinci karena Anda harus mengulang. Pelajari baik-baik!
            </div>
          )}

          <h2 className="text-2xl font-semibold mb-4">{material.title}</h2>

          {/* Menampilkan konten materi */}
          <div className="prose max-w-none">
            {/* Di sini Anda bisa merender HTML atau Markdown.
              Untuk saat ini, kita tampilkan sebagai teks biasa.
            */}
            <p className="text-gray-700 whitespace-pre-wrap">
              {material.content}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t text-right">
            <Link to={`/latihan/${material.id}`}>
              <Button color="blue">
                Lanjut ke Latihan
                <HiArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
