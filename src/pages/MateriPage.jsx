// Penjelasan: Impor library yang kita butuhkan
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAuth } from "../hooks/useAuth";

import {
  HiLockClosed,
  HiArrowRight,
  HiOutlineUserCircle, // <-- Ganti HiOutlineLogout 
  HiCheckCircle, 
} from "react-icons/hi";

export default function MateriPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchMateriAndProgress = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const { data: materialsData, error: materialsError } = await supabase
          .from("materials")
          .select("id, title")
          .order("id", { ascending: true });

        if (materialsError) throw materialsError;

        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("material_id, status")
          .eq("user_id", user.id);

        if (progressError) throw progressError;

        const progressMap = new Map();
        progressData.forEach((p) => {
          progressMap.set(p.material_id, p.status);
        });

        const combinedMaterials = materialsData.map((material, index) => {
          let isLocked = false;

          if (index > 0) {
            const previousMaterialId = materialsData[index - 1].id;
            const previousStatus = progressMap.get(previousMaterialId);
            if (previousStatus !== "lulus") isLocked = true;
          }

          return {
            ...material,
            isLocked: isLocked,
            status: progressMap.get(material.id),
          };
        });

        setMaterials(combinedMaterials);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMateriAndProgress();
  }, [user]);

  // ---------- LOADING ----------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4 text-lg text-gray-700">Memuat materi...</span>
      </div>
    );
  }

  // ---------- ERROR ----------
  if (error) {
    return (
      <div className="container p-4 mx-auto mt-10">
        <div className="p-4 text-white bg-red-500 rounded-md">
          <strong className="font-semibold">Error:</strong> {error}
        </div>
      </div>
    );
  }

  // ---------- HALAMAN UTAMA ----------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-white shadow-md">
                <h1 className="text-2xl font-bold text-blue-600">INQURA</h1>   
           {" "}
        <div className="flex items-center gap-4">
                   {" "}
          <span className="hidden text-sm text-gray-600 sm:block">
                        {user.email}         {" "}
          </span>
          {/* --- UBAH TOMBOL INI --- */}         {" "}
          <button
            onClick={() => navigate("/profile")} // <-- Arahkan ke /profile
            className="flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
                        <HiOutlineUserCircle className="w-5 h-5 mr-2" />       
                Profile          {" "}
          </button>
                 {" "}
        </div>
             {" "}
      </nav>

      {/* Konten Utama */}
      <main className="container p-4 mx-auto mt-8">
        <h2 className="mb-6 text-3xl font-semibold text-gray-800">
          Dashboard Materi
        </h2>
        <p className="mb-8 text-lg text-gray-600">
          Selesaikan materi secara berurutan untuk membuka materi berikutnya.
        </p>

        {/* Grid Materi */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <div
              key={material.id}
              className={`p-6 rounded-xl shadow-md border transition-all ${
                material.isLocked ? "bg-gray-200 border-gray-300" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h5
                  className={`text-2xl font-bold ${
                    material.isLocked ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {material.title}
                </h5>

                {!material.status && (
                  <span className="px-3 py-1 text-sm font-semibold text-white bg-gray-400 rounded-full">
                    Belum Mulai
                  </span>
                )}

                {material.status === "lulus" && (
                  <span className="px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full">
                    <HiCheckCircle className="mr-1" />
                    Selesai
                  </span>
                )}

                {material.status === "mengulang" && (
                  <span className="px-2 py-1 text-sm text-white bg-red-500 rounded">
                    Mode Remedial
                  </span>
                )}
              </div>

              <p
                className={`mt-3 ${
                  material.isLocked ? "text-gray-500" : "text-gray-700"
                }`}
              >
                {material.isLocked
                  ? "Selesaikan materi sebelumnya untuk membuka."
                  : "Klik tombol di bawah untuk memulai."}
              </p>

              {/* BUTTON */}
              {material.isLocked ? (
                <button
                  disabled
                  className="flex items-center justify-center w-full py-2 mt-4 font-medium text-gray-600 bg-gray-300 rounded-md cursor-not-allowed"
                >
                  <HiLockClosed className="w-5 h-5 mr-2" />
                  Terkunci
                </button>
              ) : (
                <Link to={`/materi/${material.id}`} className="w-full">
                  <button className="flex items-center justify-center w-full py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Mulai Belajar
                    <HiArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
