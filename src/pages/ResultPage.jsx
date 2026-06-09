import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { supabase } from '../supabase/client';
import { useAuth } from '../hooks/useAuth';
import {
  HiCheckCircle,
  HiXCircle,
  HiArrowRight,
  HiRefresh,
} from 'react-icons/hi'; // Sesuaikan jika ada perbedaan library icon lu

export default function ResultPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  // State awal untuk pengumpulan tugas akhir (No 9)
  const [projectUrl, setProjectUrl] = useState('');
  const [isProjectSubmitted, setIsProjectSubmitted] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);

  // Ambil data yang dikirim dari LatihanPage
  const { score, status, levelPassed, currentLevel, userAnswers } =
    location.state || {};

  // Filter soal yang dijawab salah saja (No 8)
  const wrongAnswers = userAnswers
    ? userAnswers.filter((ans) => !ans.isCorrect)
    : [];

  // Ambil status kelulusan final materi (Jika status dari DB bernilai 'lulus')
  const isMaterLulus = status === 'lulus';

  // Ambil status tugas jika siswa me-refresh halaman hasil
  useEffect(() => {
    const checkProjectStatus = async () => {
      if (!user || !id) return;

      const { data: prog } = await supabase
        .from('progress')
        .select('final_project_url')
        .eq('user_id', user.id)
        .eq('material_id', id)
        .single();

      if (prog?.final_project_url) {
        setProjectUrl(prog.final_project_url);
        setIsProjectSubmitted(true);
      }
    };

    checkProjectStatus();
  }, [id, user]);

  // Jika data state navigasi kosong atau hilang
  if (!location.state) {
    return (
      <div className="p-10 text-center text-gray-500 font-medium">
        Data hasil tidak ditemukan.
      </div>
    );
  }

  // Komponen Renderer Markdown Internal agar syntax kode di soal yang salah tetap rapi
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
                customStyle={{ borderRadius: '6px', margin: '0.5rem 0' }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-gray-200 px-1 rounded text-red-600 font-mono text-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }) => (
            <p className="text-gray-700 m-0 leading-relaxed">{children}</p>
          ),
        }}
      >
        {content || ''}
      </ReactMarkdown>
    );
  };

  // Logika Teks Pesan dan Aksi Tombol Navigasi Tangga Adaptif
  let messageTitle = '';
  let messageDesc = '';
  let buttonText = '';
  let buttonAction = null;

  if (isMaterLulus) {
    messageTitle = 'Selamat! Materi Selesai';
    messageDesc =
      'Anda telah menaklukkan level Hard. Seluruh rangkaian materi telah berhasil Anda tuntas.';
    buttonText = 'Kembali ke Dashboard';
    buttonAction = () => navigate('/materi');
  } else if (levelPassed) {
    messageTitle = 'Level Tuntas! Naik Tingkat 🚀';
    messageDesc = `Hebat! Nilai Anda ${score}. Karena Anda berhasil di level ${currentLevel}, sekarang tantangan akan ditingkatkan kembali.`;
    buttonText = 'Lanjut ke Level Berikutnya';
    buttonAction = () => navigate(`/materi/${id}`);
  } else {
    messageTitle = 'Belum Lulus KKM';
    messageDesc = `Nilai Anda ${score}. Jangan menyerah! Kami akan menyesuaikan materi dan soal agar lebih mudah dipahami.`;
    buttonText = 'Coba Lagi (Remedial)';
    buttonAction = () => navigate(`/materi/${id}`);
  }

  // Fungsi menyimpan link tugas ke Supabase (No 9)
  const handleSaveProject = async () => {
    if (!projectUrl.trim()) {
      alert('Masukkan link tugas kamu terlebih dahulu!');
      return;
    }

    setSubmittingProject(true);
    try {
      const { error } = await supabase
        .from('progress')
        .update({ final_project_url: projectUrl })
        .eq('user_id', user.id)
        .eq('material_id', id);

      if (error) throw error;

      alert('Luar biasa! Solusi tugas akhir kamu berhasil dikumpulkan.');
      setIsProjectSubmitted(true);
    } catch (err) {
      alert('Gagal mengumpulkan tugas: ' + err.message);
    } finally {
      setSubmittingProject(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Diubah ke max-w-2xl agar tampilan list evaluasi soal salah gak sumpek */}
      <Card className="max-w-2xl w-full text-center p-6 md:p-8 shadow-md bg-white rounded-2xl">
        {levelPassed ? (
          <HiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        ) : (
          <HiXCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        )}

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {messageTitle}
        </h1>
        <p className="text-sm text-gray-600 mb-6 px-2">{messageDesc}</p>

        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
            Skor Akhir
          </p>
          <p
            className={`text-4xl font-black my-1 ${levelPassed ? 'text-green-600' : 'text-red-600'}`}
          >
            {score}
          </p>
          <span className="inline-block bg-gray-200 text-gray-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
            Level: {currentLevel}
          </span>
        </div>

        {/* ================= NO 8: DETAIL EVALUASI SOAL SALAH ================= */}
        {!levelPassed && wrongAnswers.length > 0 && (
          <div className="mb-6 text-left bg-red-50 border border-red-200 rounded-xl p-4 md:p-5">
            <h3 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
              📊 Analisis Informasi: Soal yang Perlu Dievaluasi
            </h3>
            <p className="text-[11px] text-red-700 mb-3 italic">
              *Pelajari kembali kesalahanmu pada pertanyaan-pertanyaan berikut
              sebelum mencoba remedial:
            </p>

            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
              {wrongAnswers.map((ans, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border border-red-100 shadow-sm text-left"
                >
                  <p className="text-xs font-bold text-gray-500 mb-1">
                    ❌ Pertanyaan Ke-{idx + 1}:
                  </p>
                  <div className="text-sm text-gray-800 mb-2 bg-gray-50 p-2 rounded.xl border border-gray-100">
                    <MarkdownRenderer content={ans.questionText} />
                  </div>
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <p>
                      <span className="font-semibold text-red-600">
                        Jawaban Kamu:
                      </span>{' '}
                      {ans.userAnswer}
                    </p>
                    <p>
                      <span className="font-semibold text-green-600">
                        Kunci Jawaban:
                      </span>{' '}
                      {ans.correctAnswer}
                    </p>
                  </div>
                  {ans.explanation && (
                    <div className="text-[11px] text-gray-600 mt-2 bg-amber-50 p-2 rounded border border-amber-100 italic">
                      <span className="font-bold text-amber-800">
                        Tips Evaluasi:
                      </span>{' '}
                      {ans.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= NO 9: FORM SUBMIT TUGAS AKHIR ================= */}
        {score >= 70 && currentLevel === 'Hard' && (
          <div className="mt-2 mb-6 p-5 bg-green-50 border-2 border-dashed border-green-300 text-left rounded-xl shadow-inner">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🚀</span>
              <h4 className="font-bold text-green-900 text-base">
                Tantangan Akhir: Sajikan Solusimu!
              </h4>
            </div>
            <p className="text-xs text-green-800 mb-4 leading-relaxed">
              Selamat! Kamu telah membuktikan pemahaman logikamu dengan lulus di
              level Advanced. Sekarang, implementasikan konsep tersebut menjadi
              kode program utuh untuk menyelesaikan{' '}
              <strong>"Tantangan Dunia Nyata"</strong> yang ada di awal materi
              tadi.
              <br />
              <span className="text-[10px] text-gray-500 font-medium block mt-1">
                *Tulis kodemu di GitHub/Replit/Google Drive, lalu tempel link
                solusinya di bawah.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
              <input
                type="url"
                placeholder="https://github.com/nama-kamu/solusi-percabangan-if"
                className="flex-1 border border-gray-300 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-700"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                disabled={isProjectSubmitted}
              />
              <Button
                color={isProjectSubmitted ? 'light' : 'blue'}
                onClick={handleSaveProject}
                disabled={submittingProject || isProjectSubmitted}
                className="font-bold text-xs px-4"
              >
                {submittingProject
                  ? 'Mengirim...'
                  : isProjectSubmitted
                    ? '✅ Terkumpul'
                    : 'Kumpulkan'}
              </Button>
            </div>
          </div>
        )}

        {/* Tombol Utama Bawaan Dashboard Admin */}
        <Button
          color={isMaterLulus ? 'success' : 'blue'}
          className="w-full justify-center text-base py-2.5 mt-2"
          onClick={buttonAction}
        >
          {buttonText}
          {isMaterLulus ? (
            <HiArrowRight className="ml-2" />
          ) : (
            <HiRefresh className="ml-2" />
          )}
        </Button>
      </Card>
    </div>
  );
}
