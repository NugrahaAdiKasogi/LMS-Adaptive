import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAuth } from "../hooks/useAuth";
import { 
  HiArrowLeft, 
  HiArrowRight, 
  HiDocumentDownload, // <-- Jangan lupa import ikon ini
  HiDocumentText 
} from "react-icons/hi";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Spinner } from "../components/ui/Etc";

export default function MateriDetailPage() {
  const [materialData, setMaterialData] = useState(null);
  const [activeContent, setActiveContent] = useState(null); // { text, video, label, color }
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;
      setLoading(true);

      // 1. Ambil Data Materi Lengkap
      // Kita select '*' jadi kolom file_url otomatis ikut terambil
      const { data: mat, error: matError } = await supabase
        .from("materials")
        .select("*") 
        .eq("id", id)
        .single();

      if (matError) {
        console.error(matError);
        setLoading(false);
        return;
      }

      // 2. Ambil Progress User untuk menentukan Level Adaptif
      const { data: prog } = await supabase
        .from("progress")
        .select("attempts")
        .eq("user_id", user.id)
        .eq("material_id", id)
        .single();

      const attempts = prog?.attempts || 0;

      // 3. LOGIKA ADAPTIF (Tentukan Materi & Video)
      let content = {};

      if (attempts === 0) {
        // Level 1: Hard
        content = {
          text: mat.content_hard,
          video: mat.video_hard,
          label: "Materi Utama (Advanced)",
          color: "bg-red-100 text-red-800 border-red-300",
          desc: "Pelajari konsep utama ini untuk menghadapi tantangan level Hard."
        };
      } else if (attempts === 1) {
        // Level 2: Medium
        content = {
          text: mat.content_medium,
          video: mat.video_medium,
          label: "Materi Pendalaman (Intermediate)",
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          desc: "Mari kita ulangi bagian yang mungkin terlewat. Persiapan level Medium."
        };
      } else {
        // Level 3: Easy
        content = {
          text: mat.content_easy,
          video: mat.video_easy,
          label: "Materi Dasar (Fundamental)",
          color: "bg-green-100 text-green-800 border-green-300",
          desc: "Kita mulai dari dasar lagi agar fondasi Anda kuat. Persiapan level Easy."
        };
      }

      setMaterialData(mat);
      setActiveContent(content);
      setLoading(false);
    };

    fetchData();
  }, [id, user]);

  if (loading) return <div className="flex justify-center h-screen items-center"><Spinner /></div>;
  if (!materialData) return <div className="p-8 text-center">Materi tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-white shadow sticky top-0 z-10">
        <Button color="light" onClick={() => navigate("/materi")}>
          <HiArrowLeft className="w-5 h-5 mr-2" /> Dashboard
        </Button>
        <h1 className="text-lg md:text-xl font-bold text-blue-600 truncate max-w-xs md:max-w-none">
          {materialData.title}
        </h1>
      </nav>

      <main className="max-w-4xl p-4 mx-auto mt-6">
        
        {/* Banner Level Adaptif */}
        <div className={`p-4 rounded-lg border mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center ${activeContent.color}`}>
          <div className="flex-1">
            <h2 className="font-bold text-lg flex items-center gap-2">
              {activeContent.label}
            </h2>
            <p className="text-sm opacity-90 mt-1">{activeContent.desc}</p>
          </div>
        </div>

        {/* Video Section (Iframe) */}
        {activeContent.video && (
          <Card className="mb-6 p-0 overflow-hidden bg-black">
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={activeContent.video}
                title="Video Pembelajaran"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </Card>
        )}

        {/* Text Content */}
        <Card className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Materi Pembelajaran</h3>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {activeContent.text || "Belum ada materi teks untuk level ini."}
          </div>
        </Card>

        {/* --- FITUR BARU: TOMBOL DOWNLOAD PPT --- */}
        {/* Hanya muncul jika file_url tidak kosong */}
        {materialData.file_url && (
          <div className="mb-8">
            <a 
              href={materialData.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer no-underline"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <HiDocumentText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-blue-600">Materi Presentasi (PPT/PDF)</h4>
                  <p className="text-sm text-gray-500">Klik untuk mengunduh atau melihat file materi tambahan.</p>
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded-full text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                <HiDocumentDownload className="w-6 h-6" />
              </div>
            </a>
          </div>
        )}
        {/* --------------------------------------- */}

        {/* Action Button */}
        <div className="flex justify-end">
          <Link to={`/latihan/${materialData.id}`}>
            <Button color="blue" className="px-8 py-3 text-lg shadow-lg hover:scale-105 transform transition-transform">
              Lanjut ke Latihan
              <HiArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </Link>
        </div>

      </main>
    </div>
  );
}