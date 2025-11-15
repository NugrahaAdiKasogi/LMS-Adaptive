// src/components/ui/Modal.jsx
import React from "react";

export default function Modal({ show, onClose, children }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden relative">
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

Modal.Header = function ({ children }) {
  return (
    <div className="px-6 py-4 border-b flex items-center gap-2 text-lg font-semibold">
      {children}
    </div>
  );
};

Modal.Body = function ({ children }) {
  return <div className="px-6 py-4">{children}</div>;
};

Modal.Footer = function ({ children }) {
  return (
    <div className="px-6 py-4 border-t flex justify-end gap-2">{children}</div>
  );
};
