import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import {
  HiPencil,
  HiTrash,
  HiPlus,
  HiArrowLeft,
  HiArrowRight,
  HiUpload,
  HiDocumentDownload,
} from "react-icons/hi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import { Spinner } from "../../components/ui/Etc";

export default function ManageMateri() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State untuk Upload
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content_hard: "",
    video_hard: "",
    content_medium: "",
    video_medium: "",
    content_easy: "",
    video_easy: "",
    file_url: "", // <-- Kolom Baru
  });

  // --- FETCH DATA ---
  const fetchMaterials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .order("id", { ascending: true });

    if (error) alert(error.message);
    else setMaterials(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // --- HANDLE FILE UPLOAD ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFileToStorage = async (file) => {
    // Buat nama file unik: timestamp_namafile
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;

    const { data, error } = await supabase.storage
      .from("materials") // Nama bucket yg tadi dibuat
      .upload(fileName, file);

    if (error) throw error;

    // Ambil Public URL
    const { data: publicUrlData } = supabase.storage
      .from("materials")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  // --- SUBMIT FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalFileUrl = formData.file_url;

      // 1. Jika ada file baru dipilih, upload dulu
      if (selectedFile) {
        finalFileUrl = await uploadFileToStorage(selectedFile);
      }

      // 2. Siapkan data final
      const payload = { ...formData, file_url: finalFileUrl };

      // 3. Simpan ke Database
      if (editingId) {
        const { error } = await supabase
          .from("materials")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("materials").insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchMaterials();
      alert("Berhasil menyimpan materi!");
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus materi ini?")) return;
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (!error) fetchMaterials();
  };

  const openModal = (material = null) => {
    setEditingId(material?.id || null);
    setSelectedFile(null); // Reset file chooser
    setFormData({
      title: material?.title || "",
      content_hard: material?.content_hard || "",
      video_hard: material?.video_hard || "",
      content_medium: material?.content_medium || "",
      video_medium: material?.video_medium || "",
      content_easy: material?.content_easy || "",
      video_easy: material?.video_easy || "",
      file_url: material?.file_url || "",
    });
    setIsModalOpen(true);
  };

  if (loading)
    return (
      <div className="flex justify-center mt-10">
        <Spinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button color="light" onClick={() => navigate("/admin/")}>
              <HiArrowLeft className="w-5 h-5 mr-2" /> Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Kelola Materi</h1>
          </div>
          <Button color="blue" onClick={() => openModal(null)}>
            <HiPlus className="w-5 h-5 mr-2" /> Tambah Materi
          </Button>
        </div>

        <div className="grid gap-4">
          {materials.map((m) => (
            <Card key={m.id} className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{m.title}</h3>
                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                  <span>Level: 3 Variasi</span>
                  {m.file_url && (
                    <span className="flex items-center text-blue-600">
                      <HiDocumentDownload className="mr-1" /> Ada File PPT
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button color="light" onClick={() => openModal(m)}>
                  <HiPencil />
                </Button>
                <Button color="failure" onClick={() => handleDelete(m.id)}>
                  <HiTrash />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Modal.Header>
            {editingId ? "Edit Materi" : "Tambah Materi"}
          </Modal.Header>
          <Modal.Body>
            <form
              id="materiForm"
              onSubmit={handleSubmit}
              className="space-y-4 max-h-[70vh] overflow-y-auto px-2"
            >
              {/* Judul & File Upload Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Judul Materi
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* INPUT FILE UPLOAD */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Upload File (PPT/PDF)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-gray-100 border hover:bg-gray-200 px-3 py-2 rounded flex items-center gap-2 text-sm">
                      <HiUpload /> Pilih File
                      <input
                        type="file"
                        className="hidden"
                        accept=".ppt,.pptx,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <span className="text-xs text-gray-500 truncate max-w-[150px]">
                      {selectedFile
                        ? selectedFile.name
                        : formData.file_url
                        ? "File sudah ada"
                        : "Belum ada file"}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="my-2" />

              {/* LEVEL 1: HARD */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                <h4 className="font-bold text-red-800">
                  Level 1: Utama (Utk Soal Hard)
                </h4>
                <textarea
                  rows={3}
                  className="w-full border rounded p-2"
                  placeholder="Isi Materi Utama..."
                  value={formData.content_hard}
                  onChange={(e) =>
                    setFormData({ ...formData, content_hard: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  placeholder="URL Youtube Embed (Hard)"
                  value={formData.video_hard}
                  onChange={(e) =>
                    setFormData({ ...formData, video_hard: e.target.value })
                  }
                />
              </div>

              {/* LEVEL 2: MEDIUM */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
                <h4 className="font-bold text-yellow-800">
                  Level 2: Remedial 1 (Utk Soal Medium)
                </h4>
                <textarea
                  rows={3}
                  className="w-full border rounded p-2"
                  placeholder="Isi Materi Penjelasan..."
                  value={formData.content_medium}
                  onChange={(e) =>
                    setFormData({ ...formData, content_medium: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  placeholder="URL Youtube Embed (Medium)"
                  value={formData.video_medium}
                  onChange={(e) =>
                    setFormData({ ...formData, video_medium: e.target.value })
                  }
                />
              </div>

              {/* LEVEL 3: EASY */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                <h4 className="font-bold text-green-800">
                  Level 3: Remedial Dasar (Utk Soal Easy)
                </h4>
                <textarea
                  rows={3}
                  className="w-full border rounded p-2"
                  placeholder="Isi Materi Dasar..."
                  value={formData.content_easy}
                  onChange={(e) =>
                    setFormData({ ...formData, content_easy: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  placeholder="URL Youtube Embed (Easy)"
                  value={formData.video_easy}
                  onChange={(e) =>
                    setFormData({ ...formData, video_easy: e.target.value })
                  }
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <button
              type="submit"
              form="materiForm"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              {uploading ? <Spinner /> : "Simpan"}
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
