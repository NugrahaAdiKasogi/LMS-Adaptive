// src/components/ui/Alert.jsx
import React from "react";

export default function Alert({ color, icon: Icon, children, className }) {
  const variants = {
    success: "bg-green-100 border-green-300 text-green-700",
    failure: "bg-red-100 border-red-300 text-red-700",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };

  return (
    <div
      className={`flex items-center gap-2 border p-4 rounded-lg ${
        variants[color]
      } ${className || ""}`}
    >
      {Icon && <Icon className="w-6 h-6" />}
      <span>{children}</span>
    </div>
  );
}
