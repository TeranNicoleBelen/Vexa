import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { pedidosService, reportesService } from '../../utils/api';
import { toast } from 'react-toastify';

const ESTADOS = ['pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado', 'cancelado'];
const estadoBadge = {
  pendiente: { bg: '#FFF3CD', color: '#856404' },
  confirmado: { bg: '#D1ECF1', color: '#0C5460' },
  en_proceso: { bg: '#FFE0B2', color: '#E65100' },
  enviado: { bg: '#CCE5FF', color: '#004085' },
  entregado: { bg: '#D4EDDA', color: '#155724' },
  cancelado: { bg: '#F8D7DA', color: '#721C24' },
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);
  const [filterEstado, setFilterEstado] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterEstado) params.estado = filterEstado;
      const r = await pedidosService.getAll(params);
      setPedidos(r.data.data || []);
    } catch { toast.error('Error al cargar pedidos'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterEstado]);

  const openDetail = async (id) => {
    try {
      const r = await pedidosService.getById(id);
      setDetailModal(r.data.data);
    } catch { toast.error('Error al cargar detalle'); }
  };

  const handleEstado = async (id, estado) => {
    try {
      await pedidosService.updateEstado(id, estado);
      toast.success('Estado actualizado');
      load();
      if (detailModal?.id === id) {
        const r = await pedidosService.getById(id);
        setDetailModal(r.data.data);
      }
    } catch { toast.error('Error al actualizar'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este pedido del sistema?')) return;
    try { await pedidosService.delete(id); toast.success('Pedido eliminado'); load(); }
    catch { toast.error('Error'); }
  };

  const filtered = pedidos.filter(p =>
    (p.codigo_pedido || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.cliente_nombre || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.cliente_email || '').toLowerCase().includes(search.toLowerCase())
  );

  

  return (
    <AdminLayout title="Pedidos" subtitle="Gestiona y actualiza el estado de los pedidos">
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <input type="text" placeholder="🔍 Buscar por código o cliente..." value={search} onChange={e => setSearch(e.target.value)} className="form-control" style={{ maxWidth: 300 }} />
        <select className="form-control" style={{ maxWidth: 200 }} value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
        </select>
        <a href={reportesService.getVentasPDF()} target="_blank" rel="noreferrer" className="btn btn-secondary">
          📄 Exportar PDF
        </a>
      </div>

      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Código</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Entrega</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const b = estadoBadge[p.estado] || estadoBadge.pendiente;
                return (
                  <tr key={p.id}>
                    <td><strong style={{ color: '#E8637A', fontFamily: 'monospace' }}>{p.codigo_pedido}</strong></td>
                    <td>
                      <div><strong style={{ fontSize: 13 }}>{p.cliente_nombre} {p.cliente_apellido}</strong></div>
                      <div style={{ fontSize: 12, color: '#9B7B84' }}>{p.cliente_email}</div>
                    </td>
                    <td><strong style={{ color: '#E8637A' }}>Bs {parseFloat(p.total).toFixed(2)}</strong></td>
                    <td><span className="badge badge-pink" style={{ textTransform: 'uppercase' }}>{p.metodo_pago}</span></td>
                    <td style={{ textTransform: 'capitalize' }}>{p.tipo_entrega}</td>
                    <td>
                      <select
                        value={p.estado}
                        onChange={e => handleEstado(p.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 20, border: `1px solid ${b.color}`, background: b.bg, color: b.color, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                      >
                        {ESTADOS.map(est => <option key={est} value={est}>{est.charAt(0).toUpperCase() + est.slice(1)}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: 12, color: '#9B7B84', whiteSpace: 'nowrap' }}>{new Date(p.created_at).toLocaleDateString('es-BO')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openDetail(p.id)}>👁️ Ver</button>
                        <a href={reportesService.getPedidoPDF(p.id)} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#F0E0E5', color: '#5C3D47', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>📄</a>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9B7B84' }}>No hay pedidos</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailModal(null)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>Pedido #{detailModal.codigo_pedido}</h3>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={S.infoBox}>
                  <h4 style={S.infoTitle}>👤 Cliente</h4>
                  <p><strong>{detailModal.cliente_nombre} {detailModal.cliente_apellido}</strong></p>
                  <p style={{ color: '#9B7B84', fontSize: 13 }}>{detailModal.cliente_email}</p>
                  <p style={{ color: '#9B7B84', fontSize: 13 }}>{detailModal.cliente_telefono || '-'}</p>
                </div>
                <div style={S.infoBox}>
                  <h4 style={S.infoTitle}>📦 Entrega</h4>
                  <p style={{ textTransform: 'capitalize' }}><strong>{detailModal.tipo_entrega}</strong></p>
                  {detailModal.tipo_entrega === 'envio' && (
                    <>
                      <p style={{ fontSize: 13, color: '#5C3D47' }}>{detailModal.direccion_envio}</p>
                      <p style={{ fontSize: 13, color: '#9B7B84' }}>{detailModal.ciudad}, {detailModal.zona}</p>
                      <p style={{ fontSize: 13, color: '#9B7B84' }}>Ref: {detailModal.referencia}</p>
                    </>
                  )}
                  {detailModal.tipo_entrega === 'recogida' && <p style={{ fontSize: 13, color: '#5C3D47' }}>Av. Principal 123, La Paz</p>}
                </div>
              </div>

              <h4 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Productos</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: '#FFF0F3' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#E8637A' }}>Producto</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 12, color: '#E8637A' }}>Cant.</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: '#E8637A' }}>Precio</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: '#E8637A' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(detailModal.detalles || []).map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #F0E0E5' }}>
                      <td style={{ padding: '10px 12px', fontSize: 14 }}>{d.producto_nombre}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 14 }}>{d.cantidad}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 14 }}>Bs {parseFloat(d.precio_unitario).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#E8637A' }}>Bs {parseFloat(d.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ background: '#F9F0F3', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Subtotal:</span><strong>Bs {parseFloat(detailModal.subtotal).toFixed(2)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Envío:</span><strong>{parseFloat(detailModal.costo_envio) === 0 ? 'Gratis' : `Bs ${parseFloat(detailModal.costo_envio).toFixed(2)}`}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, color: '#E8637A', borderTop: '1px solid #FFB6C1', paddingTop: 10, marginTop: 8 }}>
                  <span>TOTAL:</span><strong>Bs {parseFloat(detailModal.total).toFixed(2)}</strong>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, display: 'block' }}>Cambiar Estado:</label>
                <select
                  value={detailModal.estado}
                  onChange={e => handleEstado(detailModal.id, e.target.value)}
                  className="form-control"
                  style={{ maxWidth: 220 }}
                >
                  {ESTADOS.map(est => <option key={est} value={est}>{est.charAt(0).toUpperCase() + est.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <a href={reportesService.getPedidoPDF(detailModal.id)} target="_blank" rel="noreferrer" className="btn btn-secondary">📄 Descargar PDF</a>
              <button className="btn btn-primary" onClick={() => setDetailModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const S = {
  infoBox: { background: '#F9F0F3', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 },
  infoTitle: { fontSize: 14, fontWeight: 700, color: '#E8637A', marginBottom: 6 },
};
