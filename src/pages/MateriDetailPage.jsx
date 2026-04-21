import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useAuth } from '../hooks/useAuth';
import {
  HiArrowLeft,
  HiArrowRight,
  HiDocumentDownload, // <-- Jangan lupa import ikon ini
  HiDocumentText,
} from 'react-icons/hi';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Spinner } from '../components/ui/Etc';

export default function MateriDetailPage() {
  const [materialData, setMaterialData] = useState(null);
  const [activeContent, setActiveContent] = useState(null); // { text, video, label, color }
  const [loading, setLoading] = useState(true);
  const [hasReflected, setHasReflected] = useState(false);

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
        .from('materials')
        .select('*, real_world_problem, reflection_link')
        .eq('id', id)
        .single();

      if (matError) {
        console.error(matError);
        setLoading(false);
        return;
      }

      // 2. Ambil Progress User untuk menentukan Level Adaptif
      const { data: prog } = await supabase
        .from('progress')
        .select('attempts')
        .eq('user_id', user.id)
        .eq('material_id', id)
        .single();

      const attempts = prog?.attempts || 0;

      // 3. LOGIKA ADAPTIF (Tentukan Materi & Video)
      let content = {};

      if (attempts === 0) {
        // Level 1: Hard
        content = {
          text: mat.content_hard,
          video: mat.video_hard,
          label: 'Materi Utama (Advanced)',
          color: 'bg-red-100 text-red-800 border-red-300',
          desc: 'Pelajari konsep utama ini untuk menghadapi tantangan level Hard.',
        };
      } else if (attempts === 1) {
        // Level 2: Medium
        content = {
          text: mat.content_medium,
          video: mat.video_medium,
          label: 'Materi Pendalaman (Intermediate)',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          desc: 'Mari kita ulangi bagian yang mungkin terlewat. Persiapan level Medium.',
        };
      } else {
        // Level 3: Easy
        content = {
          text: mat.content_easy,
          video: mat.video_easy,
          label: 'Materi Dasar (Fundamental)',
          color: 'bg-green-100 text-green-800 border-green-300',
          desc: 'Kita mulai dari dasar lagi agar fondasi Anda kuat. Persiapan level Easy.',
        };
      }

      setMaterialData(mat);
      setActiveContent(content);
      setLoading(false);
    };

    fetchData();
  }, [id, user]);

  console.log(materialData);

  if (loading)
    return (
      <div className="flex justify-center h-screen items-center">
        <Spinner />
      </div>
    );
  if (!materialData)
    return <div className="p-8 text-center">Materi tidak ditemukan.</div>;

  const MarkdownRenderer = ({ content }) => {
    return (
      <ReactMarkdown
        components={{
          // Fungsi ini akan menangkap tag <code> di Markdown
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                customStyle={{ borderRadius: '8px', margin: '1.5rem 0' }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-gray-200 px-1 rounded text-red-600"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Merapikan tampilan list dan paragraf agar tidak berantakan
          p: ({ children }) => (
            <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc ml-6 mb-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-6 mb-4">{children}</ol>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-white shadow sticky top-0 z-10">
        <Button color="light" onClick={() => navigate('/materi')}>
          <HiArrowLeft className="w-5 h-5 mr-2" /> Dashboard
        </Button>
        <h1 className="text-lg md:text-xl font-bold text-blue-600 truncate max-w-xs md:max-w-none">
          {materialData.title}
        </h1>
      </nav>

      <main className="max-w-4xl p-4 mx-auto mt-6">
        {/* Banner Level Adaptif */}
        <div
          className={`p-4 rounded-lg border mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center ${activeContent.color}`}
        >
          <div className="flex-1">
            <h2 className="font-bold text-lg flex items-center gap-2">
              {activeContent.label}
            </h2>
            <p className="text-sm opacity-90 mt-1">{activeContent.desc}</p>
          </div>
        </div>

        {/* realworld problem section */}
        {materialData?.real_world_problem && (
          <div className="mb-8 p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧐</span>
              <h3 className="text-lg font-bold text-amber-900">
                Tantangan Dunia Nyata
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed italic">
              "{materialData.real_world_problem}"
            </p>
          </div>
        )}

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
          <MarkdownRenderer content={activeContent?.text} />
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
                  <h4 className="font-bold text-gray-800 group-hover:text-blue-600">
                    Materi Presentasi (PPT/PDF)
                  </h4>
                  <p className="text-sm text-gray-500">
                    Klik untuk mengunduh atau melihat file materi tambahan.
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded-full text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                <HiDocumentDownload className="w-6 h-6" />
              </div>
            </a>
          </div>
        )}
        {/* --------------------------------------- */}
        {/* Form */}
        <div className="mt-12 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Sudah Selesai Belajar?
          </h3>
          <p className="text-gray-600 mb-6">
            Yuk, isi refleksi diri untuk membuka akses ke Latihan Soal.
          </p>

          <div className="flex flex-wrap gap-4">
            {materialData?.reflection_link && (
              <a
                href={materialData.reflection_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setHasReflected(true)} // Mengubah state saat diklik
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>📝</span>Isi Form Refleksi
              </a>
            )}

            {/* Tombol Tanya Pengajar tetap bisa diakses kapan saja */}
            <button
              onClick={() =>
                window.open(`https://wa.me/NOMOR_WA_ANDA`, '_blank')
              }
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
              <span>💬</span> Tanya Pengajar
            </button>
          </div>
        </div>

        {/* Action Button */}
        {/* Bagian Navigasi di paling bawah */}
        <div className="mt-10 flex justify-center border-t pt-8">
          {hasReflected ? (
            <Link to={`/latihan/${materialData.id}`}>
              <Button
                color="blue"
                size="lg"
                className="animate-bounce" // Opsional: beri animasi agar terlihat menonjol
              >
                Lanjut ke Latihan Soal <HiArrowRight className="ml-2" />
              </Button>
            </Link>
          ) : (
            <div className="text-center p-4 bg-gray-100 rounded-lg text-gray-500 italic">
              Selesaikan refleksi terlebih dahulu untuk membuka Latihan Soal.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
