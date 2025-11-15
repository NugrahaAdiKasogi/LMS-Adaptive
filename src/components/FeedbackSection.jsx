// src/components/FeedbackSection.jsx
import { useState, useEffect } from "react";
import {
  HiCheckCircle,
  HiXCircle,
  HiLightBulb,
  HiArrowRight,
} from "react-icons/hi";

import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

export default function FeedbackSection({
  isCorrect,
  question,
  onNext,
  isLastQuestion,
}) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!isCorrect) setShowPopup(true);
  }, [isCorrect]);

  return (
    <>
      {/* ALERT */}
      <Alert
        color={isCorrect ? "success" : "failure"}
        icon={isCorrect ? HiCheckCircle : HiXCircle}
        className="mt-6"
      >
        {isCorrect
          ? "Benar! Kerja bagus!"
          : "Salah! Silakan baca materi pengingat."}
      </Alert>

      {/* NEXT BUTTON */}
      <div className="mt-8 text-right">
        <Button color="blue" onClick={onNext}>
          {isLastQuestion ? "Selesai & Lihat Hasil" : "Soal Berikutnya"}
          <HiArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* POPUP MODAL */}
      <Modal show={showPopup} onClose={() => setShowPopup(false)}>
        <Modal.Header>
          <HiLightBulb className="w-6 h-6 text-yellow-400" />
          Materi Pengingat
        </Modal.Header>

        <Modal.Body>
          <p className="text-gray-600">
            Jawaban Anda kurang tepat. Berikut ulasan materi:
          </p>

          <p className="p-4 bg-gray-100 rounded-lg mt-4 text-gray-800">
            {question?.feedback_salah_popup}
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShowPopup(false)}>Saya Mengerti</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
