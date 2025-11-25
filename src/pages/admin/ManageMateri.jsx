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

export default function ManageMateri() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Modal (Tambah/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Jika null = Mode Tambah, Jika ada ID = Mode Edit
  
  // State untuk Form Data
  const [formData, setFormData] = useState({
    title: "",
    materi_reguler: "",
    materi_rinci: "",
  });

  // --- 1. FETCH DATA (READ) ---
  const fetchMaterials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .order("id", { ascending: true });

    if (error) setError(error.message);
    else setMaterials(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // --- 2. HANDLE SUBMIT (CREATE & UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        // Mode EDIT: Update data yang sudah ada
        const { error } = await supabase
          .from("materials")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        // Mode TAMBAH: Insert data baru
        const { error } = await supabase
          .from("materials")
          .insert([formData]);
        if (error) throw error;
      }

      // Reset form dan tutup modal
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: "", materi_reguler: "", materi_rinci: "" });
      fetchMaterials(); // Refresh data
      alert("Berhasil menyimpan materi!");

    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  // --- 3. HANDLE DELETE (DELETE) ---
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus materi ini? Soal-soal di dalamnya juga akan terhapus!")) return;

    try {
      const { error } = await supabase.from("materials").delete().eq("id", id);
      if (error) throw error;
      fetchMaterials(); // Refresh data
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  // Helper untuk membuka modal edit
  const openEditModal = (material) => {
    setEditingId(material.id);
    setFormData({
      title: material.title,
      materi_reguler: material.materi_reguler,
      materi_rinci: material.materi_rinci,
    });
    setIsModalOpen(true);
  };

  // Helper untuk membuka modal tambah
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: "", materi_reguler: "", materi_rinci: "" });
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button color="light" onClick={() => navigate("/admin")}>
              <HiArrowLeft className="w-5 h-5 mr-2" /> Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Kelola Materi</h1>
          </div>
          <Button color="blue" onClick={openAddModal}>
            <HiPlus className="w-5 h-5 mr-2" /> Tambah Materi
          </Button>
        </div>

        {error && <Alert color="failure" className="mb-4">{error}</Alert>}

        {/* List Materi */}
        <div className="grid gap-4">
          {materials.map((materi) => (
            <Card key={materi.id} className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{materi.title}</h3>
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {materi.materi_reguler.substring(0, 100)}...
                </p>
              </div>
              <div className="flex gap-2">
                <Button color="light" onClick={() => openEditModal(materi)}>
                  <HiPencil className="w-5 h-5" />
                </Button>
                <Button color="failure" onClick={() => handleDelete(materi.id)}>
                  <HiTrash className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal Form */}
        <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Modal.Header>
            {editingId ? "Edit Materi" : "Tambah Materi Baru"}
          </Modal.Header>
          <Modal.Body>
            <form id="materiForm" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Materi</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materi Reguler (Utama)</label>
                <textarea
                  rows={4}
                  required
                  className="w-full border rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.materi_reguler}
                  onChange={(e) => setFormData({ ...formData, materi_reguler: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materi Rinci (Remedial)</label>
                <textarea
                  rows={4}
                  required
                  className="w-full border rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Materi ini akan muncul jika siswa harus mengulang..."
                  value={formData.materi_rinci}
                  onChange={(e) => setFormData({ ...formData, materi_rinci: e.target.value })}
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <button
              type="submit"
              form="materiForm"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Simpan
            </button>
          </Modal.Footer>
        </Modal>

      </div>
    </div>
  );
}