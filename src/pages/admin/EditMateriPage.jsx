import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Etc';

// Ikon SVG Manual supaya anti-error
const IconBack = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const IconSave = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
    />
  </svg>
);

export default function EditMateriPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content_hard: '',
    video_hard: '',
    content_medium: '',
    video_medium: '',
    content_easy: '',
    video_easy: '',
    file_url: '',
    real_world_problem: '',
    reflection_link: '',
  });

  useEffect(() => {
    if (id) fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      setFormData(data);
    } catch (err) {
      alert('Gagal mengambil data: ' + err.message);
      navigate('/admin/manage-materi');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFileToStorage = async (file) => {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { error } = await supabase.storage
      .from('materials')
      .upload(fileName, file);
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage
      .from('materials')
      .getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalFileUrl = formData.file_url;
      if (selectedFile) {
        finalFileUrl = await uploadFileToStorage(selectedFile);
      }

      const payload = { ...formData, file_url: finalFileUrl };

      if (id) {
        const { error } = await supabase
          .from('materials')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('materials').insert([payload]);
        if (error) throw error;
      }

      alert('Berhasil disimpan!');
      navigate('/admin/manage-materi');
    } catch (err) {
      alert('Gagal: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center mt-20">
        <Spinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 pb-20 text-left">
      <div className="sticky top-0 z-10 bg-white border-b p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/materi')}
              className="flex items-center text-gray-600 hover:text-blue-600"
            >
              <IconBack /> <span className="font-medium">Kembali</span>
            </button>
            <h1 className="text-xl font-bold">
              {id ? 'Edit Materi' : 'Tambah Materi'}
            </h1>
          </div>
          <Button color="blue" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <Spinner size="sm" />
            ) : (
              <>
                <IconSave /> Simpan
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Info Dasar">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Judul Materi
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  File (PPT/PDF)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Link Refleksi
                </label>
                <input
                  type="url"
                  className="w-full border rounded p-2 text-sm"
                  value={formData.reflection_link}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reflection_link: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </Card>
          <Card title="Masalah Dunia Nyata">
            <label className="block text-sm font-bold mb-1">
              Masalah Nyata
            </label>
            <textarea
              rows={6}
              className="w-full border rounded p-2 text-sm"
              value={formData.real_world_problem}
              onChange={(e) =>
                setFormData({ ...formData, real_world_problem: e.target.value })
              }
            />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 bg-white rounded shadow border-l-4 border-red-500">
            <h3 className="font-bold mb-2">Level 1: Hard</h3>
            <textarea
              rows={10}
              className="w-full border rounded p-2 font-mono text-sm mb-2"
              value={formData.content_hard}
              onChange={(e) =>
                setFormData({ ...formData, content_hard: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full border rounded p-2 text-sm"
              placeholder="URL Video"
              value={formData.video_hard}
              onChange={(e) =>
                setFormData({ ...formData, video_hard: e.target.value })
              }
            />
          </div>
          <div className="p-4 bg-white rounded shadow border-l-4 border-yellow-500">
            <h3 className="font-bold mb-2">Level 2: Medium</h3>
            <textarea
              rows={8}
              className="w-full border rounded p-2 font-mono text-sm mb-2"
              value={formData.content_medium}
              onChange={(e) =>
                setFormData({ ...formData, content_medium: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full border rounded p-2 text-sm"
              placeholder="URL Video"
              value={formData.video_medium}
              onChange={(e) =>
                setFormData({ ...formData, video_medium: e.target.value })
              }
            />
          </div>
          <div className="p-4 bg-white rounded shadow border-l-4 border-green-500">
            <h3 className="font-bold mb-2">Level 3: Easy</h3>
            <textarea
              rows={8}
              className="w-full border rounded p-2 font-mono text-sm mb-2"
              value={formData.content_easy}
              onChange={(e) =>
                setFormData({ ...formData, content_easy: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full border rounded p-2 text-sm"
              placeholder="URL Video"
              value={formData.video_easy}
              onChange={(e) =>
                setFormData({ ...formData, video_easy: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
