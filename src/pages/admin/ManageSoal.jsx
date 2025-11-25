import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { HiPencil, HiTrash, HiPlus, HiArrowLeft } from "react-icons/hi";

// Impor komponen UI Anda
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import { Spinner } from "../../components/ui/Etc";

export default function ManageSoal() {
  const navigate = useNavigate();
  
  // Data State
  const [materials, setMaterials] = useState([]); // Untuk dropdown pilih materi
  const [questions, setQuestions] = useState([]);
  
  // UI State
  const [selectedMaterialId, setSelectedMaterialId] = useState(""); // Filter materi yang aktif
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""], // Default 4 pilihan kosong
    correct_answer: "",
    feedback_salah_popup: "",
  });

  // --- 1. FETCH MATERI (Untuk Dropdown) ---
  useEffect(() => {
    const fetchMaterials = async () => {
      const { data } = await supabase.from("materials").select("id, title").order("id");
      setMaterials(data || []);
      // Jika belum ada materi yang dipilih, pilih yang pertama otomatis
      if (data && data.length > 0 && !selectedMaterialId) {
        setSelectedMaterialId(data[0].id);
      }
    };
    fetchMaterials();
  }, []);

  // --- 2. FETCH SOAL (Berdasarkan Materi yang Dipilih) ---
  const fetchQuestions = async () => {
    if (!selectedMaterialId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("material_id", selectedMaterialId)
      .order("id", { ascending: true });

    if (error) setError(error.message);
    else setQuestions(data);
    setLoading(false);
  };

  // Ambil soal setiap kali materi yang dipilih berubah
  useEffect(() => {
    fetchQuestions();
  }, [selectedMaterialId]);


  // --- 3. HANDLE FORM CHANGES ---
  
  // Mengubah teks opsi (A, B, C, D)
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  // --- 4. SUBMIT (CREATE & UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasi sederhana
    if (!formData.correct_answer) {
      alert("Harap pilih kunci jawaban yang benar!");
      return;
    }

    try {
      const payload = {
        material_id: selectedMaterialId,
        question: formData.question,
        options: formData.options, // Array strings
        correct_answer: formData.correct_answer, // String
        feedback_salah_popup: formData.feedback_salah_popup,
      };

      if (editingId) {
        // UPDATE
        const { error } = await supabase
          .from("questions")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase
          .from("questions")
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchQuestions(); // Refresh data
      alert("Soal berhasil disimpan!");

    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  // --- 5. DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus soal ini?")) return;
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- MODAL HELPERS ---
  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
      feedback_salah_popup: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingId(q.id);
    setFormData({
      question: q.question,
      options: q.options || ["", "", "", ""],
      correct_answer: q.correct_answer,
      feedback_salah_popup: q.feedback_salah_popup,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button color="light" onClick={() => navigate("/admin")}>
              <HiArrowLeft className="w-5 h-5 mr-2" /> Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Kelola Soal</h1>
          </div>

          {/* Filter Materi */}
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700">Materi:</label>
            <select
              className="border rounded-lg p-2 pr-8 focus:ring-blue-500 focus:border-blue-500"
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tombol Tambah */}
        <div className="mb-6 flex justify-end">
           <Button color="blue" onClick={openAddModal}>
            <HiPlus className="w-5 h-5 mr-2" /> Tambah Soal Baru
          </Button>
        </div>

        {error && <Alert color="failure" className="mb-4">{error}</Alert>}

        {/* List Soal */}
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : questions.length === 0 ? (
          <Alert color="warning">Belum ada soal untuk materi ini.</Alert>
        ) : (
          <div className="grid gap-4">
            {questions.map((q, idx) => (
              <Card key={q.id} className="relative">
                <div className="pr-20"> {/* Space untuk tombol aksi */}
                  <span className="font-bold text-blue-600 mb-1 block">Soal {idx + 1}:</span>
                  <p className="font-medium text-gray-900 text-lg mb-3">{q.question}</p>
                  
                  {/* Tampilkan Pilihan */}
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, i) => (
                      <li key={i} className={`text-sm p-2 rounded border ${opt === q.correct_answer ? 'bg-green-100 border-green-300 text-green-800 font-semibold' : 'bg-gray-50'}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </li>
                    ))}
                  </ul>
                  
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Feedback Salah:</span> {q.feedback_salah_popup}
                  </p>
                </div>

                {/* Aksi */}
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                  <Button color="light" onClick={() => openEditModal(q)}>
                    <HiPencil className="w-5 h-5" />
                  </Button>
                  <Button color="failure" onClick={() => handleDelete(q.id)}>
                    <HiTrash className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Form */}
        <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Modal.Header>{editingId ? "Edit Soal" : "Tambah Soal"}</Modal.Header>
          <Modal.Body>
            <form id="soalForm" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Pertanyaan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
                <textarea
                  required
                  rows={2}
                  className="w-full border rounded-lg p-2.5"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>

              {/* Pilihan Ganda (Loop 4x) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Pilihan Jawaban</label>
                {formData.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-bold w-6">{String.fromCharCode(65 + i)}.</span>
                    <input
                      type="text"
                      required
                      className="w-full border rounded-lg p-2"
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                    />
                    {/* Radio Button untuk Kunci Jawaban */}
                    <input
                      type="radio"
                      name="correct_answer"
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                      checked={formData.correct_answer === opt && opt !== ""}
                      onChange={() => setFormData({ ...formData, correct_answer: opt })}
                      disabled={opt === ""}
                      title="Pilih sebagai kunci jawaban"
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-1">*Klik bulat radio di kanan untuk menentukan kunci jawaban.</p>
              </div>

              {/* Feedback Salah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback (Jika Salah)</label>
                <textarea
                  required
                  rows={2}
                  className="w-full border rounded-lg p-2.5"
                  placeholder="Penjelasan singkat materi..."
                  value={formData.feedback_salah_popup}
                  onChange={(e) => setFormData({ ...formData, feedback_salah_popup: e.target.value })}
                />
              </div>

            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <button
              type="submit"
              form="soalForm"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Simpan Soal
            </button>
          </Modal.Footer>
        </Modal>

      </div>
    </div>
  );
}