import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { HiPencil, HiTrash, HiPlus, HiArrowLeft, HiDocumentDownload } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Etc';

export default function ManageMateri() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('materials').select('*').order('id', { ascending: true });
    if (error) alert(error.message);
    else setMaterials(data);
    setLoading(false);
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin hapus materi ini?')) return;
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (!error) fetchMaterials();
  };

  if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button color="light" onClick={() => navigate('/admin/')}>
              <HiArrowLeft className="w-5 h-5 mr-2" /> Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Kelola Materi</h1>
          </div>
          {/* PERUBAHAN 1: NAVIGASI KE HALAMAN TAMBAH */}
          <Button color="blue" onClick={() => navigate('/admin/add-materi')}>
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
                  {m.file_url && <span className="text-blue-600"><HiDocumentDownload className="mr-1" /> Ada File PPT</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {/* PERUBAHAN 2: NAVIGASI KE HALAMAN EDIT */}
                <Button color="light" onClick={() => navigate(`/admin/edit-materi/${m.id}`)}>
                  <HiPencil />
                </Button>
                <Button color="failure" onClick={() => handleDelete(m.id)}>
                  <HiTrash />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {/* MODAL DAN FORM PANJANG SUDAH DIHAPUS DARI SINI */}
    </div>
  );
}