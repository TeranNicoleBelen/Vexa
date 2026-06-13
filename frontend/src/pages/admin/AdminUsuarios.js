import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { usuariosService, authService } from '../../utils/api';
import { toast } from 'react-toastify';

const EMPTY = { nombre: '', apellido: '', email: '', password: '', telefono: '', rol_id: 3, activo: 1 };

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [strength, setStrength] = useState(null);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await usuariosService.getAll(); setUsuarios(r.data.data || []); }
    catch { toast.error('Error al cargar usuarios'); }
    setLoading(false);
  };

  const openCreate = () => { setForm(EMPTY); setEditing(null); setStrength(null); setModal(true); };
  const openEdit = (u) => {
    setForm({ nombre: u.nombre, apellido: u.apellido, email: u.email, password: '', telefono: u.telefono || '', rol_id: u.rol_id, activo: u.activo });
    setEditing(u.id); setStrength(null); setModal(true);
  };

  const checkStrength = async (pwd) => {
    if (!pwd) return setStrength(null);
    try { const r = await authService.checkPassword(pwd); setStrength(r.data); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.email) return toast.error('Nombre, apellido y email son requeridos');
    if (!editing && !form.password) return toast.error('La contraseña es requerida para nuevos usuarios');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editing) await usuariosService.update(editing, payload);
      else await usuariosService.create(payload);
      toast.success(editing ? 'Usuario actualizado' : 'Usuario creado');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`¿Eliminar el usuario "${email}"? Esta acción es irreversible.`)) return;
    try { await usuariosService.delete(id); toast.success('Usuario eliminado'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const rolBadge = { admin: 'badge-dark', vendedor: 'badge-coral', cliente: 'badge-pink' };
  const strengthColor = { débil: '#e74c3c', intermedio: '#f39c12', fuerte: '#27ae60' };
  const strengthWidth = { débil: '33%', intermedio: '66%', fuerte: '100%' };

  const filtered = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.apellido.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Usuarios" subtitle="Gestiona los usuarios del sistema">
      <div className="flex-between mb-24">
        <input type="text" placeholder=" Buscar usuario..." value={search} onChange={e => setSearch(e.target.value)} className="form-control" style={{ maxWidth: 320 }} />
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Usuario</button>
      </div>

      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>#</th><th>Usuario</th><th>Email</th><th>Teléfono</th><th>Rol</th><th>Estado</th><th>Registro</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ color: '#9B7B84' }}>{u.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #E8637A, #FF8C69)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                        {u.nombre[0].toUpperCase()}
                      </div>
                      <div>
                        <strong>{u.nombre} {u.apellido}</strong>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#5C3D47' }}>{u.email}</td>
                  <td style={{ color: '#9B7B84' }}>{u.telefono || '-'}</td>
                  <td><span className={`badge ${rolBadge[u.rol_nombre] || 'badge-pink'}`}>{u.rol_nombre}</span></td>
                  <td><span className={`badge ${u.activo ? 'badge-success' : 'badge-danger'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td style={{ fontSize: 12, color: '#9B7B84' }}>{new Date(u.created_at).toLocaleDateString('es-BO')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}></button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id, u.email)}></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9B7B84' }}>No se encontraron usuarios</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Nombre *</label>
                    <input className="form-control" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Apellido *</label>
                    <input className="form-control" value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required disabled={!!editing} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input type="tel" className="form-control" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select className="form-control" value={form.rol_id} onChange={e => setForm(f => ({ ...f, rol_id: e.target.value }))}>
                      <option value={1}>Admin</option>
                      <option value={2}>Vendedor</option>
                      <option value={3}>Cliente</option>
                    </select>
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
                  <label className="form-label">{editing ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="form-control"
                      value={form.password}
                      onChange={e => { setForm(f => ({ ...f, password: e.target.value })); checkStrength(e.target.value); }}
                      required={!editing}
                      style={{ paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                      {showPass ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                  {form.password && strength && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ background: '#F0E0E5', height: 5, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: strengthWidth[strength.strength], background: strengthColor[strength.strength], borderRadius: 3, transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize: 12, color: strengthColor[strength.strength], fontWeight: 600 }}>Contraseña {strength.strength}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? ' Guardando...' : 'Guardar Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
