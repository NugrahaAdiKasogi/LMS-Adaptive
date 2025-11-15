// src/components/ui/Etc.jsx
import React from "react";

// Spinner
export const Spinner = () => (
  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
);

// Progress Bar
export const Progress = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
    <div className="bg-blue-600 h-4" style={{ width: `${progress}%` }}></div>
  </div>
);
