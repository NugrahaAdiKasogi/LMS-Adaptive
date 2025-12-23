import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAuth } from "../hooks/useAuth";

// UI Components
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Spinner } from "../components/ui/Etc";
import Modal from "../components/ui/Modal";
import FeedbackSection from "../components/FeedbackSection";

// Icons
import { HiCheckCircle, HiXCircle, HiLightningBolt } from "react-icons/hi";

export default function LatihanPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Data
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // [{ questionId, isCorrect, userAnswer }]

  // State Adaptif
  const [difficultyLevel, setDifficultyLevel] = useState(""); // 'Low' | 'Medium' | 'Hard'
  const [attemptCount, setAttemptCount] = useState(0);

  // State UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Feedback Popup
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null); // { isCorrect, correctAnswer, explanation }

  useEffect(() => {
    const fetchAdaptiveQuestions = async () => {
      if (!user || !id) return;

      try {
        setLoading(true);

        // 1. Cek Progress Siswa (Sudah mencoba berapa kali?)
        const { data: progressData } = await supabase
          .from("progress")
          .select("attempts")
          .eq("user_id", user.id)
          .eq("material_id", id)
          .single();

        const currentAttempts = progressData?.attempts || 0;
        setAttemptCount(currentAttempts);

        // 2. Tentukan Tingkat Kesulitan (ALGORITMA ADAPTIF)
        let targetDifficulty = "Hard"; // Default (Percobaan ke-0)

        if (currentAttempts === 1) {
          targetDifficulty = "Medium"; // Percobaan ke-1 (Remedial Ringan)
        } else if (currentAttempts >= 2) {
          targetDifficulty = "Low"; // Percobaan ke-2+ (Remedial Dasar)
        }

        setDifficultyLevel(targetDifficulty);

        // 3. Ambil Soal Sesuai Level
        const { data: questionsData, error: qError } = await supabase
          .from("questions")
          .select(
            "id, question, options, correct_answer, feedback_salah_popup, difficulty"
          )
          .eq("material_id", id)
          .eq("difficulty", targetDifficulty); // Filter Difficulty

        if (qError) throw qError;

        // Fallback: Jika soal level tersebut kosong (belum dibuat admin), ambil semua level
        if (!questionsData || questionsData.length === 0) {
          console.warn(
            `Soal level ${targetDifficulty} kosong, mengambil semua soal.`
          );
          const { data: allQuestions } = await supabase
            .from("questions")
            .select("*")
            .eq("material_id", id);
          setQuestions(allQuestions || []);
        } else {
          setQuestions(questionsData);
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat soal latihan.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdaptiveQuestions();
  }, [id, user]);

  // --- LOGIKA MENJAWAB (Sama seperti sebelumnya) ---
  const handleAnswer = (selectedOption) => {
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQ.correct_answer;

    // Simpan jawaban
    const answerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      userAnswer: selectedOption,
      correctAnswer: currentQ.correct_answer,
      isCorrect: isCorrect,
      explanation: currentQ.feedback_salah_popup,
    };

    // Update state jawaban user
    setUserAnswers((prev) => [...prev, answerRecord]);

    // Tampilkan Feedback Modal
    setCurrentFeedback(answerRecord);
    setShowFeedbackModal(true);
  };

  const handleNextQuestion = () => {
    setShowFeedbackModal(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitResults();
    }
  };

  const submitResults = async () => {
    setLoading(true);

    // Hitung Skor (Opsional: Bisa disesuaikan bobotnya per level)
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    // Tambahkan logika jawaban terakhir ke array temp jika belum masuk (karena state async)
    // Tapi karena kita pakai flow modal -> next, state userAnswers sudah aman saat submit dipanggil
    // Namun perlu diperhatikan: userAnswers berisi jawaban SAMPAI soal sebelum terakhir jika submit dipanggil manual
    // Di sini submit dipanggil oleh handleNextQuestion saat index habis, jadi userAnswers perlu menyertakan soal terakhir.
    // Koreksi: userAnswers SUDAH diupdate di handleAnswer, jadi aman.
    // Tapi tunggu, userAnswers di dalam handleAnswer adalah 'prev', update state belum tentu selesai saat submit dipanggil?
    // Solusi: Kita gunakan userAnswers.length untuk cek, atau hitung manual skor dari parameter jika perlu.
    // React state update batching aman di sini karena ada jeda interaksi modal.

    // Untuk memastikan data jawaban terakhir masuk, kita ambil dari state + currentFeedback (jika ada yg pending)
    // Tapi logic modal flow menjamin user klik "Lanjut" dulu.

    // Namun untuk amannya kita gabungkan userAnswers state dengan jawaban terakhir jika userAnswers length < questions length
    let finalAnswers = [...userAnswers];
    if (finalAnswers.length < questions.length && currentFeedback) {
      finalAnswers.push(currentFeedback);
    }

    const finalCorrectCount = finalAnswers.filter((a) => a.isCorrect).length;
    const score = Math.round((finalCorrectCount / questions.length) * 100);
    const status = score >= 70 ? "lulus" : "mengulang";

    // 1. Update Progress (Upsert)
    const attempts = attemptCount + 1; // Tambah 1 dari yang diambil di awal

    const { error: saveError } = await supabase.from("progress").upsert(
      {
        user_id: user.id,
        material_id: id,
        score,
        status,
        attempts,
      },
      { onConflict: "user_id,material_id" }
    );

    if (saveError) {
      console.error(saveError);
    }

    // 2. Simpan Riwayat (Insert History)
    const { error: historyError } = await supabase
      .from("attempt_history")
      .insert([
        {
          user_id: user.id,
          user_email: user.email,
          material_id: id,
          score: score,
          status: status,
        },
      ]);

    // Navigate ke Result
    navigate(`/result/${id}`, {
      state: {
        score,
        status,
        correctCount: finalCorrectCount,
        totalCount: questions.length,
      },
    });
  };

  // --- RENDER ---
  if (loading)
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (questions.length === 0)
    return <div className="p-10 text-center">Tidak ada soal tersedia.</div>;

  const currentQ = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Helper warna badge level
  const getLevelBadge = (level) => {
    if (level === "Hard")
      return (
        <span className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold border border-red-200">
          <HiLightningBolt /> Level: HARD
        </span>
      );
    if (level === "Medium")
      return (
        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200">
          <HiLightningBolt /> Level: MEDIUM
        </span>
      );
    return (
      <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
        <HiLightningBolt /> Level: EASY
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Header Info */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 mt-4">
        <span className="text-gray-500 font-medium">
          Soal {currentQuestionIndex + 1} dari {questions.length}
        </span>
        {getLevelBadge(difficultyLevel)}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Card Soal */}
      <Card className="w-full max-w-2xl p-6 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-gray-700 active:scale-95"
            >
              <span className="font-bold mr-3 text-gray-400">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>
      </Card>

      {/* Modal Feedback Langsung */}
      <Modal show={showFeedbackModal} onClose={() => {}}>
        <div className="text-center">
          {currentFeedback?.isCorrect ? (
            <HiCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          ) : (
            <HiXCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          )}

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {currentFeedback?.isCorrect
              ? "Jawaban Benar! 🎉"
              : "Jawaban Kurang Tepat"}
          </h3>

          {!currentFeedback?.isCorrect && (
            <div className="bg-red-50 p-4 rounded-lg mb-4 text-left border border-red-100">
              <p className="text-sm font-bold text-red-800 mb-1">
                Kunci Jawaban:
              </p>
              <p className="text-red-700 mb-2">
                {currentFeedback?.correctAnswer}
              </p>
              <p className="text-sm font-bold text-gray-700 mb-1">
                Penjelasan:
              </p>
              <p className="text-gray-600 text-sm">
                {currentFeedback?.explanation}
              </p>
            </div>
          )}

          <Button
            color="blue"
            className="w-full justify-center mt-4"
            onClick={handleNextQuestion}
          >
            {currentQuestionIndex < questions.length - 1
              ? "Lanjut ke Soal Berikutnya"
              : "Lihat Hasil Akhir"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
