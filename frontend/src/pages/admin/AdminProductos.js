import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { productosService, categoriasService } from '../../utils/api';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const EMPTY = { nombre: '', descripcion: '', precio: '', stock: '', stock_minimo: '5', categoria_id: '', marca: '', codigo: '', activo: 1, imagen: null };

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
    categoriasService.getAll({ activo: 1 }).then(r => setCategorias(r.data.data || []));
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productosService.getAll({ limit: 100 });
      setProductos(res.data.data || []);
    } catch { toast.error('Error al cargar productos'); }
    setLoading(false);
  };

  const openCreate = () => { setForm(EMPTY); setEditing(null); setImgPreview(null); setModal(true); };
  const openEdit = (p) => {
    setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, stock_minimo: p.stock_minimo, categoria_id: p.categoria_id, marca: p.marca || '', codigo: p.codigo || '', activo: p.activo, imagen: null });
    setImgPreview(p.imagen ? `${API_BASE}${p.imagen}` : null);
    setEditing(p.id);
    setModal(true);
  };

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, imagen: file }));
    setImgPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio || form.stock === '' || !form.categoria_id) return toast.error('Completa los campos requeridos');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
      if (editing) await productosService.update(editing, fd);
      else await productosService.create(fd);
      toast.success(editing ? 'Producto actualizado' : 'Producto creado');
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar'); }
    setSaving(false);
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el producto "${nombre}"?`)) return;
    try { await productosService.delete(id); toast.success('Producto eliminado'); load(); }
    catch { toast.error('Error al eliminar'); }
  };

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.marca || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.categoria_nombre || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Productos" subtitle="Gestiona el catálogo de productos VEXA">
      <div className="flex-between mb-24">
        <input type="text" placeholder="🔍 Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} className="form-control" style={{ maxWidth: 320 }} />
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Producto</button>
      </div>

      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.imagen
                      ? <img src={`${API_BASE}${p.imagen}`} alt={p.nombre} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                      : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'linear-gradient(135deg, #FFD1DC, #FFDAB9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🧴</div>
                    }
                  </td>
                  <td>
                    <strong>{p.nombre}</strong>
                    {p.marca && <div style={{ fontSize: 12, color: '#9B7B84' }}>{p.marca}</div>}
                  </td>
                  <td><span className="badge badge-pink">{p.categoria_nombre}</span></td>
                  <td><strong style={{ color: '#E8637A' }}>Bs {parseFloat(p.precio).toFixed(2)}</strong></td>
                  <td>
                    <span style={{ color: p.stock === 0 ? '#e74c3c' : p.stock <= p.stock_minimo ? '#f39c12' : '#27ae60', fontWeight: 700 }}>
                      {p.stock}
                    </span>
                  </td>
                  <td><span className={`badge ${p.activo ? 'badge-success' : 'badge-danger'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}>✏️ Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, p.nombre)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9B7B84' }}>No se encontraron productos</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h3>{editing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Image upload */}
                <div className="form-group" style={{ textAlign: 'center' }}>
                  <label htmlFor="img-upload" className="image-upload-area" style={{ cursor: 'pointer', display: 'block' }}>
                    {imgPreview
                      ? <img src={imgPreview} alt="preview" className="image-preview" />
                      : <><div style={{ fontSize: 40, marginBottom: 8 }}>📷</div><p style={{ color: '#9B7B84', fontSize: 14 }}>Click para subir imagen del producto</p></>
                    }
                    <input id="img-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Nombre *</label>
                    <input className="form-control" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Marca</label>
                    <input className="form-control" value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio (Bs) *</label>
                    <input type="number" step="0.01" min="0" className="form-control" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Categoría *</label>
                    <select className="form-control" value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))} required>
                      <option value="">Seleccionar...</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input type="number" min="0" className="form-control" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Mínimo</label>
                    <input type="number" min="0" className="form-control" value={form.stock_minimo} onChange={e => setForm(f => ({ ...f, stock_minimo: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Código</label>
                    <input className="form-control" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="PROD-XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select className="form-control" value={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.value }))}>
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" rows={3} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
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
