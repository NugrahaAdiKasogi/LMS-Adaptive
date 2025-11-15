import { useState, useEffect } from "react";
import {
  HiCheckCircle,
  HiXCircle,
  HiLightBulb,
  HiArrowRight,
} from "react-icons/hi";

// --------------------------------------------------------------
// Custom Components (Pengganti Flowbite-React)
// --------------------------------------------------------------
function AlertCustom({ color, icon: Icon, children, className }) {
  const variants = {
    success: "bg-green-100 border-green-300 text-green-700",
    failure: "bg-red-100 border-red-300 text-red-700",
  };

  return (
    <div
      className={`flex items-center gap-2 border p-4 rounded-lg ${variants[color]} ${className}`}
    >
      <Icon className="w-6 h-6" />
      <span>{children}</span>
    </div>
  );
}

function ButtonCustom({ children, onClick, color = "blue" }) {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    gray: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${colors[color]}`}
    >
      {children}
    </button>
  );
}

function ModalCustom({ show, onClose, children }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden animate-fadeIn">
        {children}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

ModalCustom.Header = function ({ children }) {
  return (
    <div className="px-6 py-4 border-b flex items-center gap-2 text-lg font-semibold">
      {children}
    </div>
  );
};

ModalCustom.Body = function ({ children }) {
  return <div className="px-6 py-4">{children}</div>;
};

ModalCustom.Footer = function ({ children }) {
  return (
    <div className="px-6 py-4 border-t flex justify-end gap-2">{children}</div>
  );
};

// --------------------------------------------------------------
// FEEDBACK SECTION (Main Component)
// --------------------------------------------------------------
export default function FeedbackSection({
  isCorrect,
  question,
  onNext,
  isLastQuestion,
}) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isCorrect === false) {
      setShowPopup(true);
    }
  }, [isCorrect, question]);

  return (
    <>
      {/* ALERT */}
      <AlertCustom
        color={isCorrect ? "success" : "failure"}
        icon={isCorrect ? HiCheckCircle : HiXCircle}
        className="mt-6"
      >
        {isCorrect
          ? "Benar! Kerja bagus!"
          : "Salah/Kurang tepat! Silakan baca materi pengingat."}
      </AlertCustom>

      {/* BUTTON NEXT */}
      <div className="mt-8 text-right">
        <ButtonCustom color="blue" onClick={onNext}>
          {isLastQuestion ? "Selesai & Lihat Hasil" : "Soal Berikutnya"}
          <HiArrowRight className="w-5 h-5" />
        </ButtonCustom>
      </div>

      {/* MODAL */}
      <ModalCustom show={showPopup} onClose={() => setShowPopup(false)}>
        <ModalCustom.Header>
          <HiLightBulb className="w-6 h-6 text-yellow-400" />
          Materi Pengingat
        </ModalCustom.Header>

        <ModalCustom.Body>
          <p className="text-gray-600">
            Jawaban Anda kurang tepat. Berikut ulasan materi:
          </p>

          <p className="p-4 bg-gray-100 rounded-lg mt-4 text-gray-800">
            {question?.feedback_salah_popup}
          </p>
        </ModalCustom.Body>

        <ModalCustom.Footer>
          <ButtonCustom onClick={() => setShowPopup(false)}>Saya Mengerti</ButtonCustom>
        </ModalCustom.Footer>
      </ModalCustom>
    </>
  );
}
