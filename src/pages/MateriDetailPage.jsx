import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useAuth } from '../hooks/useAuth';
import {
  HiArrowLeft,
  HiArrowRight,
  HiDocumentDownload,
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
  const [activeContent, setActiveContent] = useState(null); // { text, video, label, color, desc }
  const [loading, setLoading] = useState(true);
  const [hasReflected, setHasReflected] = useState(false);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [isHypothesisSubmitted, setIsHypothesisSubmitted] = useState(false);

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;
      setLoading(true);

      // 1. Ambil Data Materi Lengkap
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

      // 2. Ambil Progress User untuk menentukan Level Adaptif & Hipotesis Awal
      const { data: prog } = await supabase
        .from('progress')
        .select('attempts, student_name, hypothesis')
        .eq('user_id', user.id)
        .eq('material_id', id)
        .single();

      if (prog?.hypothesis) {
        setIsHypothesisSubmitted(true);
        setStudentName(prog.student_name || '');
        setHypothesis(prog.hypothesis || '');
      }

      const attempts = prog?.attempts || 0;
      setCurrentAttempts(attempts);

      // 3. LOGIKA ADAPTIF (Tentukan Materi & Video)
      let content = {};

      if (attempts === 0) {
        content = {
          text: mat.content_hard,
          video: mat.video_hard,
          label: 'Materi Utama (Advanced)',
          color: 'bg-red-100 text-red-800 border-red-300',
          desc: 'Pelajari konsep utama ini untuk menghadapi tantangan level Hard.',
        };
      } else if (attempts === 1) {
        content = {
          text: mat.content_medium,
          video: mat.video_medium,
          label: 'Materi Pendalaman (Intermediate)',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          desc: 'Mari kita ulangi bagian yang mungkin terlewat. Persiapan level Medium.',
        };
      } else {
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

  const MarkdownRenderer = ({ content }) => {
    return (
      <ReactMarkdown
        components={{
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
          p: ({ children }) => (
            <p className="mb-4 text-gray-700 leading-relaxed text-left">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc ml-6 mb-4 text-left">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-6 mb-4 text-left">{children}</ol>
          ),
        }}
      >
        {content || ''}
      </ReactMarkdown>
    );
  };

  const handleSaveHypothesis = async () => {
    if (!studentName.trim() || !hypothesis.trim()) {
      alert('Nama dan Hipotesis wajib diisi sebelum mulai belajar!');
      return;
    }

    try {
      const { error } = await supabase.from('progress').upsert(
        {
          user_id: user.id,
          material_id: id,
          student_name: studentName,
          hypothesis: hypothesis,
          status: 'mengulang',
          attempts: currentAttempts,
        },
        { onConflict: 'user_id,material_id' }
      );

      if (error) throw error;

      alert('Hipotesis berhasil dikirim! Selamat belajar.');
      setIsHypothesisSubmitted(true);
    } catch (err) {
      alert('Gagal menyimpan hipotesis: ' + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center h-screen items-center">
        <Spinner />
      </div>
    );

  if (!materialData)
    return <div className="p-8 text-center">Materi tidak ditemukan.</div>;

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
        {/* SECTION 1: Tantangan Dunia Nyata (Selalu Tampil Paling Atas) */}
        {materialData?.real_world_problem && (
          <div className="mb-8 p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg shadow-sm text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧐</span>
              <h3 className="text-lg font-bold text-amber-900">
                Tantangan Dunia Nyata
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed italic whitespace-pre-line">
              "{materialData.real_world_problem}"
            </p>
          </div>
        )}

        {/* ALUR PERCABANGAN UTAMA (NO 6) */}
        {!isHypothesisSubmitted && currentAttempts === 0 ? (
          /* KONDISI A: Siswa Belum Submit Hipotesis di Awal */
          <Card className="p-6 border-2 border-blue-200 text-left bg-white shadow-md">
            <h4 className="font-bold text-blue-900 text-lg mb-4 border-b pb-2">
              📋 Form Rumusan Masalah & Hipotesis
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nama Siswa:
              </label>
              <input
                type="text"
                placeholder="Ketik nama lengkap kamu..."
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Pertanyaan / Hipotesis Awal:
              </label>
              <p className="text-xs text-gray-500 mb-2 italic">
                *Tuliskan dugaan caramu menyelesaikan masalah pemrograman di
                atas berdasarkan pengetahuan yang kamu miliki saat ini.
              </p>
              <textarea
                rows={4}
                placeholder="Contoh: Menurut saya, sistem kelulusan bisa menggunakan logika seleksi jika nilai di atas 75 maka..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
              />
            </div>

            <Button
              color="blue"
              className="w-full justify-center py-2.5 font-bold"
              onClick={handleSaveHypothesis}
            >
              Submit Jawaban & Buka Materi Pembelajaran 🚀
            </Button>
          </Card>
        ) : (
          /* KONDISI B: Sudah Submit Hipotesis ATAU Sedang Sesi Remedial (attempts > 0) */
          <>
            {/* Banner Level Adaptif */}
            <div
              className={`p-4 rounded-lg border mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center text-left ${activeContent.color}`}
            >
              <div className="flex-1">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  {activeContent.label}
                </h2>
                <p className="text-sm opacity-90 mt-1">{activeContent.desc}</p>
              </div>
            </div>

            {/* Video Section (Iframe) */}
            {activeContent.video && (
              <Card className="mb-6 p-0 overflow-hidden bg-black shadow-sm">
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

            {/* Text Content (Markdown) */}
            <Card className="mb-6 p-6">
              <MarkdownRenderer content={activeContent?.text} />
            </Card>

            {/* Fitur Download PPT */}
            {materialData.file_url && (
              <div className="mb-8">
                <a
                  href={materialData.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer no-underline text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <HiDocumentText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-blue-600 mb-1">
                        Materi Presentasi (PPT/PDF)
                      </h4>
                      <p className="text-sm text-gray-500">
                        Klik untuk mengunduh atau melihat file materi tambahan.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded-full text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <HiDocumentDownload className="w-6 h-6" />
                  </div>
                </a>
              </div>
            )}

            {/* Section Refleksi (Hanya muncul di iterasi awal/Materi Hard) */}
            {currentAttempts === 0 && (
              <div className="mt-12 p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
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
                      onClick={() => setHasReflected(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>📝</span>Isi Form Refleksi
                    </a>
                  )}

                  <button
                    onClick={() =>
                      window.open('https://wa.me/6281220619052', '_blank')
                    }
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <span>💬</span> Tanya Pengajar
                  </button>
                </div>
              </div>
            )}

            {/* Bagian Navigasi Latihan Soal di paling bawah */}
            <div className="mt-10 flex justify-center border-t pt-8">
              {/* Tombol aktif jika sudah isi refleksi ATAU sedang sesi remedial (attempts > 0) */}
              {hasReflected || currentAttempts > 0 ? (
                <Link to={`/latihan/${materialData.id}`}>
                  <Button color="blue" size="lg" className="animate-bounce">
                    Lanjut ke Latihan Soal <HiArrowRight className="ml-2" />
                  </Button>
                </Link>
              ) : (
                <div className="text-center p-4 bg-gray-100 rounded-lg text-gray-500 italic w-full">
                  Selesaikan refleksi terlebih dahulu untuk membuka Latihan
                  Soal.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
