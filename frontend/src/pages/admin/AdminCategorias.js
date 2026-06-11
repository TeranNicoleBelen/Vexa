import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { categoriasService } from '../../utils/api';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const EMPTY = { nombre: '', descripcion: '', color: '#FFB6C1', activo: 1, imagen: null };

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await categoriasService.getAll(); setCategorias(r.data.data || []); }
    catch { toast.error('Error al cargar categorías'); }
    setLoading(false);
  };

  const openCreate = () => { setForm(EMPTY); setEditing(null); setImgPreview(null); setModal(true); };
  const openEdit = (c) => {
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '', color: c.color || '#FFB6C1', activo: c.activo, imagen: null });
    setImgPreview(c.imagen ? `${API_BASE}${c.imagen}` : null);
    setEditing(c.id); setModal(true);
  };

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, imagen: file }));
    setImgPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return toast.error('El nombre es requerido');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null) fd.append(k, v); });
      if (editing) await categoriasService.update(editing, fd);
      else await categoriasService.create(fd);
      toast.success(editing ? 'Categoría actualizada' : 'Categoría creada');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la categoría "${nombre}"? Los productos asociados no se eliminarán.`)) return;
    try { await categoriasService.delete(id); toast.success('Categoría eliminada'); load(); }
    catch { toast.error('Error al eliminar'); }
  };

  return (
    <AdminLayout title="Categorías" subtitle="Gestiona las categorías de productos">
      <div className="flex-between mb-24">
        <p style={{ color: '#9B7B84' }}>{categorias.length} categorías registradas</p>
        <button className="btn btn-primary" onClick={openCreate}>+ Nueva Categoría</button>
      </div>

      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {categorias.map(cat => (
            <div key={cat.id} style={S.card}>
              <div style={{ ...S.cardTop, background: cat.color || '#FFB6C1' }}>
                {cat.imagen
                  ? <img src={`${API_BASE}${cat.imagen}`} alt={cat.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 40 }}>{catEmojis[cat.nombre] || '🏷️'}</span>
                }
              </div>
              <div style={S.cardBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={S.catName}>{cat.nombre}</h3>
                    <p style={S.catDesc}>{cat.descripcion || 'Sin descripción'}</p>
                  </div>
                  <span className={`badge ${cat.activo ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: 2 }}>
                    {cat.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 13, color: '#9B7B84' }}>📦 {cat.total_productos} productos</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(cat)}>✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat.id, cat.nombre)}>🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ textAlign: 'center' }}>
                  <label htmlFor="cat-img" className="image-upload-area" style={{ cursor: 'pointer', display: 'block' }}>
                    {imgPreview
                      ? <img src={imgPreview} alt="preview" className="image-preview" />
                      : <><div style={{ fontSize: 40, marginBottom: 8 }}>🏷️</div><p style={{ color: '#9B7B84', fontSize: 14 }}>Click para subir imagen</p></>
                    }
                    <input id="cat-img" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input className="form-control" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" rows={3} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 50, height: 40, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                      <input className="form-control" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ flex: 1 }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select className="form-control" value={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.value }))}>
                      <option value={1}>Activa</option>
                      <option value={0}>Inactiva</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Guardando...' : '💾 Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const catEmojis = { 'Limpieza del Hogar': '🧹', 'Cuidado Personal': '🧴', 'Belleza': '💄', 'Cabello': '💇', 'Skin Care': '✨', 'Fragancias': '🌸' };

const S = {
  card: { background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 15px rgba(232,99,122,0.08)', transition: 'all 0.3s' },
  cardTop: { height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardBody: { padding: 20 },
  catName: { fontFamily: "'Playfair Display', serif", fontSize: 17, color: '#1A1A1A', marginBottom: 4 },
  catDesc: { fontSize: 13, color: '#9B7B84', lineHeight: 1.5 },
};
