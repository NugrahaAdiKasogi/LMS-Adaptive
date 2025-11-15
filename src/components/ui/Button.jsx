// src/components/ui/Button.jsx
import React from "react";

export default function Button({
  children,
  color = "gray",
  disabled,
  className,
  ...props
}) {
  const colors = {
    blue: "bg-blue-600 text-white hover:bg-blue-700",
    gray: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    success: "bg-green-600 text-white hover:bg-green-700",
    failure: "bg-red-600 text-white hover:bg-red-700",
    light: "bg-white border text-gray-700 hover:bg-gray-50",
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium flex items-center justify-center
        transition-colors
        ${colors[color]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className || ""}
      `}
    >
      {children}
    </button>
  );
}
