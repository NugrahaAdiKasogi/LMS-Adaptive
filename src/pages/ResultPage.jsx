import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  HiCheckCircle,
  HiXCircle,
  HiArrowRight,
  HiRefresh,
} from 'react-icons/hi'; 

export default function ResultPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Jika data state navigasi dari LatihanPage kosong atau hilang
  if (!location.state) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="p-10 text-center text-gray-500 font-medium bg-white rounded-xl shadow">
          Data hasil pengerjaan tidak ditemukan.
        </div>
      </div>
    );
  }

  // Ambil data yang dikirim dari LatihanPage secara tunggal (Anti-Bentrok)
  const { score, status, levelPassed, currentLevel, userAnswers } = location.state;

  // Filter soal yang dijawab salah saja (Fungsi Indikator No 8)
  const wrongAnswers = userAnswers ? userAnswers.filter((ans) => !ans.isCorrect) : [];

  // Status kelulusan final untuk satu bab materi (Lulus di level Hard)
  const isMaterLulus = status === 'lulus';

  // Komponen Renderer Markdown Internal agar kode pemrograman di dalam daftar soal salah tampil rapi
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
              <code className="bg-gray-200 px-1 rounded text-red-600 font-mono text-xs" {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => (
            <p className="text-gray-700 m-0 leading-relaxed text-left">{children}</p>
          ),
        }}
      >
        {content || ''}
      </ReactMarkdown>
    );
  };

  // Logika Penentuan Pesan Judul, Deskripsi, dan Aksi Tombol Alur Tangga Adaptif
  let messageTitle = '';
  let messageDesc = '';
  let buttonText = '';
  let buttonAction = null;

  if (isMaterLulus) {
    messageTitle = 'Selamat! Materi Selesai';
    messageDesc = 'Hebat! Anda telah menaklukkan level Hard. Seluruh rangkaian pembelajaran di bab ini telah berhasil Anda tuntaskan.';
    buttonText = 'Kembali ke Dashboard';
    buttonAction = () => navigate('/materi');
  } else if (levelPassed) {
    messageTitle = 'Level Tuntas! Naik Tingkat 🚀';
    messageDesc = `Bagus! Nilai Anda ${score}. Karena Anda berhasil melewati ambang batas di level ${currentLevel}, sekarang tantangan tingkat kesulitan akan dinaikkan kembali.`;
    buttonText = 'Lanjut ke Tantangan Berikutnya';
    buttonAction = () => navigate(`/materi/${id}`);
  } else {
    messageTitle = 'Belum Lulus KKM';
    messageDesc = `Nilai Anda ${score}. Jangan berkecil hati! Kami akan menyesuaikan kedalaman materi dan indikator soal berikutnya agar lebih mudah kamu pahami.`;
    buttonText = 'Pelajari Materi Remedial';
    buttonAction = () => navigate(`/materi/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Ukuran max-w-2xl dipertahankan agar layout evaluasi analisis informasi No 8 tidak sempit */}
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

        {/* Info Skor */}
        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
            Skor Akhir Latihan
          </p>
          <p className={`text-4xl font-black my-1 ${levelPassed ? 'text-green-600' : 'text-red-600'}`}>
            {score}
          </p>
          <span className="inline-block bg-gray-200 text-gray-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
            Evaluasi Sesi: {currentLevel}
          </span>
        </div>

        {/* ================= NO 8: DETAIL EVALUASI SOAL SALAH (ANALISIS INFORMASI) ================= */}
        {!levelPassed && wrongAnswers.length > 0 && (
          <div className="mb-6 text-left bg-red-50 border border-red-200 rounded-xl p-4 md:p-5">
            <h3 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
              📊 Analisis Informasi: Pertanyaan yang Keliru
            </h3>
            <p className="text-[11px] text-red-700 mb-4 italic">
              *Pelajari kembali kesalahan logikamu pada daftar pertanyaan berikut sebelum masuk ke sesi pengulangan materi:
            </p>
            
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {wrongAnswers.map((ans, idx) => (
                <div key={idx} className="p-4 bg-white rounded-xl border border-red-100 shadow-sm text-left">
                  <p className="text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                    ❌ Soal Ke-{idx + 1}:
                  </p>
                  <div className="text-sm text-gray-800 mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <MarkdownRenderer content={ans.questionText} />
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 pl-0.5">
                    <p><span className="font-bold text-red-600">Jawaban Kamu:</span> {ans.userAnswer}</p>
                    <p><span className="font-bold text-green-600">Kunci Jawaban:</span> {ans.correctAnswer}</p>
                  </div>
                  {ans.explanation && (
                    <div className="text-[11px] text-gray-600 mt-3 bg-amber-50 p-2.5 rounded-lg border border-amber-100 italic">
                      <span className="font-bold text-amber-800">Tips Evaluasi:</span> {ans.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ========================================================================================= */}

        {/* Navigasi Utama Langkah Tangga Adaptif */}
        <Button
          color={isMaterLulus ? 'success' : 'blue'}
          className="w-full justify-center text-base py-2.5 font-bold shadow-sm"
          onClick={buttonAction}
        >
          {buttonText}
          {isMaterLulus ? (
            <HiArrowRight className="ml-2 w-5 h-5" />
          ) : (
            <HiRefresh className="ml-2 w-5 h-5" />
          )}
        </Button>
      </Card>
    </div>
  );
}