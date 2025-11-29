// src/pages/LatihanPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAuth } from "../hooks/useAuth";
import { HiArrowLeft } from "react-icons/hi";

// Import UI Components
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import Modal from "../components/ui/Modal";
import { Spinner, Progress } from "../components/ui/Etc";

// Feedback Section
import FeedbackSection from "../components/FeedbackSection";

export default function LatihanPage() {
  const getOptionKey = (index) => String.fromCharCode(65 + index);

  const [material, setMaterial] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [answered, setAnswered] = useState(false);
  const [lastAnswerIsCorrect, setLastAnswerIsCorrect] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load soal dari Supabase
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const { data: materialData } = await supabase
          .from("materials")
          .select("id, title")
          .eq("id", id)
          .single();

        setMaterial(materialData);

        const { data: questionsData } = await supabase
          .from("questions")
          .select("*")
          .eq("material_id", id);

        const shuffled = questionsData.sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [id, user]);

  const handleSelectAnswer = (key) => {
    if (!answered) setSelectedAnswer(key);
  };

  const handleCheckAnswer = () => {
    const current = questions[currentIndex];
    const index = selectedAnswer.charCodeAt(0) - 65;
    const selectedText = current.options[index];

    const correct = selectedText === current.correct_answer;

    setLastAnswerIsCorrect(correct);
    setAnswered(true);

    setUserAnswers((prev) => [
      ...prev,
      { question: current.id, isCorrect: correct },
    ]);
  };

  const handleNextQuestion = () => {
    setAnswered(false);
    setSelectedAnswer(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitResults();
    }
  };

  const submitResults = async () => {
    setLoading(true);

    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const status = score >= 70 ? "lulus" : "mengulang";

    // --- LOGIKA 1: Update Progress Siswa (Agar dashboard update) ---
    const { data: prev } = await supabase
      .from("progress")
      .select("attempts")
      .eq("user_id", user.id)
      .eq("material_id", id)
      .single();

    const attempts = (prev?.attempts || 0) + 1;

    // Simpan ke Progress (Upsert/Timpa)
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
      setError(saveError.message);
      setLoading(false);
      return;
    }

    // --- LOGIKA 2 (BARU): Simpan Riwayat untuk Admin ---
    // Kita Insert (bukan upsert) agar data lama tidak hilang
    const { error: historyError } = await supabase
      .from("attempt_history")
      .insert([
        {
          user_id: user.id,
          user_email: user.email, // Kita simpan email juga
          material_id: id,
          score: score,
          status: status,
          // created_at otomatis diisi database
        },
      ]);

    if (historyError) {
      console.error("Gagal simpan history:", historyError);
      // Kita tidak stop proses, karena yang penting progress siswa aman
    }

    // Pindah halaman
    navigate(`/result/${id}`, {
      state: {
        score,
        status,
        correctCount,
        totalCount: questions.length,
      },
    });
  };

  // ===== Render States =====

  if (loading && questions.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <Spinner />
        <p className="mt-4 text-gray-700">Memuat soal...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-4 mt-10">
        <Alert color="failure">{error}</Alert>
      </div>
    );

  if (!user || questions.length === 0)
    return (
      <div className="p-4 mt-10">
        <Alert color="warning">Belum ada soal untuk materi ini.</Alert>
      </div>
    );

  const currentQuestion = questions[currentIndex];

  const getButtonColor = (optionKey) => {
    if (!answered) return selectedAnswer === optionKey ? "blue" : "gray";

    const index = optionKey.charCodeAt(0) - 65;
    const text = currentQuestion.options[index];

    if (text === currentQuestion.correct_answer) return "success";
    if (optionKey === selectedAnswer) return "failure";
    return "gray";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-white shadow">
        <Button color="light" onClick={() => navigate("/materi")}>
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Kembali
        </Button>
        <h1 className="text-xl font-bold text-blue-600">{material?.title}</h1>
      </nav>

      <main className="max-w-2xl p-4 mx-auto mt-8">
        <Card>
          {/* Progress */}
          <Progress progress={((currentIndex + 1) / questions.length) * 100} />

          <p className="mt-2 text-sm text-center text-gray-600">
            Soal {currentIndex + 1} dari {questions.length}
          </p>

          {/* Soal */}
          <h2 className="mt-6 mb-4 text-xl font-semibold">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-4">
            {currentQuestion.options.map((value, index) => {
              const key = getOptionKey(index);
              return (
                <Button
                  key={key}
                  color={getButtonColor(key)}
                  disabled={answered}
                  onClick={() => handleSelectAnswer(key)}
                  className="w-full text-left"
                >
                  <span className="mr-2 font-bold">{key}.</span>
                  {value}
                </Button>
              );
            })}
          </div>

          {/* Feedback / Next */}
          <div className="mt-8">
            {!answered ? (
              <div className="text-right">
                <Button
                  color="blue"
                  disabled={!selectedAnswer}
                  onClick={handleCheckAnswer}
                >
                  Cek Jawaban
                </Button>
              </div>
            ) : (
              <FeedbackSection
                isCorrect={lastAnswerIsCorrect}
                question={currentQuestion}
                onNext={handleNextQuestion}
                isLastQuestion={currentIndex === questions.length - 1}
              />
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
