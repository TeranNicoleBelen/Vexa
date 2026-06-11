import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { pedidosService, reportesService } from '../../utils/api';

export default function OrderConfirmPage() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pedidosService.getById(id).then(r => setPedido(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (!pedido) return null;

  
  const pdfUrl = reportesService.getPedidoPDF(id);

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '60px 24px 80px', maxWidth: 700 }}>
        {/* Success banner */}
        <div style={S.successBanner}>
          <div style={S.checkCircle}>✓</div>
          <h1 style={S.title}>¡Pedido Confirmado!</h1>
          <p style={S.sub}>Código: <strong style={{ color: '#E8637A' }}>{pedido.codigo_pedido}</strong></p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Te enviaremos actualizaciones sobre tu pedido</p>
        </div>

        {/* Ticket */}
        <div style={S.ticket}>
          <div style={S.ticketHeader}>
            <h2 style={S.ticketBrand}>VEXA</h2>
            <p style={S.ticketSub}>Ticket de Pedido</p>
          </div>

          <div style={S.infoGrid}>
            <div style={S.infoItem}><span style={S.infoLabel}>Fecha</span><strong>{new Date(pedido.created_at).toLocaleString('es-BO')}</strong></div>
            <div style={S.infoItem}><span style={S.infoLabel}>Estado</span><span style={{ ...S.badge, background: '#D4EDDA', color: '#155724' }}>{pedido.estado}</span></div>
            <div style={S.infoItem}><span style={S.infoLabel}>Pago</span><strong style={{ textTransform: 'uppercase' }}>{pedido.metodo_pago}</strong></div>
            <div style={S.infoItem}><span style={S.infoLabel}>Entrega</span><strong style={{ textTransform: 'capitalize' }}>{pedido.tipo_entrega}</strong></div>
          </div>

          {pedido.tipo_entrega === 'envio' && (
            <div style={S.addressBox}>
              <h3 style={S.addressTitle}>📦 Dirección de Entrega</h3>
              <p><strong>Dirección:</strong> {pedido.direccion_envio}</p>
              <p><strong>Ciudad:</strong> {pedido.ciudad} | <strong>Zona:</strong> {pedido.zona}</p>
              <p><strong>Referencia:</strong> {pedido.referencia}</p>
              <p><strong>Contacto:</strong> {pedido.telefono_contacto}</p>
            </div>
          )}
          {pedido.tipo_entrega === 'recogida' && (
            <div style={{ ...S.addressBox, background: '#F0FDF4', borderColor: '#86EFAC' }}>
              <h3 style={S.addressTitle}>🏪 Retiro en Tienda</h3>
              <p><strong>Dirección:</strong> Mercado Ciudad Satélite, El Alto</p>
              <p><strong>Horario:</strong> Lunes a Sábado, 8:00 – 20:00</p>
              <p><strong>Teléfono:</strong> +591 60612998</p>
            </div>
          )}

          {/* Products */}
          <h3 style={S.productsTitle}>Productos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FFF0F3' }}>
                <th style={S.th}>Producto</th>
                <th style={S.th}>Cant.</th>
                <th style={S.th}>Precio</th>
                <th style={S.th}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.detalles?.map(d => (
                <tr key={d.id}>
                  <td style={S.td}>{d.producto_nombre}</td>
                  <td style={{ ...S.td, textAlign: 'center' }}>{d.cantidad}</td>
                  <td style={S.td}>Bs {parseFloat(d.precio_unitario).toFixed(2)}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: '#E8637A' }}>Bs {parseFloat(d.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={S.totals}>
            <div style={S.totalRow}><span>Subtotal:</span><span>Bs {parseFloat(pedido.subtotal).toFixed(2)}</span></div>
            <div style={S.totalRow}><span>Envío:</span><span style={{ color: parseFloat(pedido.costo_envio) === 0 ? '#27ae60' : '#E8637A' }}>{parseFloat(pedido.costo_envio) === 0 ? 'Gratis' : `Bs ${parseFloat(pedido.costo_envio).toFixed(2)}`}</span></div>
            <div style={{ ...S.totalRow, fontSize: 22, fontWeight: 800, color: '#E8637A', borderTop: '2px solid #FFB6C1', paddingTop: 12, marginTop: 8 }}>
              <span>TOTAL:</span><span>Bs {parseFloat(pedido.total).toFixed(2)}</span>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: '#9B7B84', fontSize: 13, marginTop: 20 }}>Gracias por tu compra en VEXA ♥</p>
        </div>

        {/* Actions */}
        <div style={S.actions}>
          <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
            📄 Descargar Ticket PDF
          </a>
          <Link to="/mis-pedidos" className="btn btn-secondary btn-lg">📦 Ver Mis Pedidos</Link>
          <Link to="/tienda" className="btn" style={{ background: '#F0E0E5', color: '#5C3D47' }}>🛍️ Seguir Comprando</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const S = {
  successBanner: { background: 'linear-gradient(135deg, #E8637A, #FF8C69)', borderRadius: 20, padding: 40, textAlign: 'center', marginBottom: 32, color: 'white' },
  checkCircle: { width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, margin: '0 auto 16px' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 36, color: 'white', marginBottom: 8 },
  sub: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 8 },
  ticket: { background: 'white', borderRadius: 20, boxShadow: '0 8px 40px rgba(232,99,122,0.15)', overflow: 'hidden', marginBottom: 32 },
  ticketHeader: { background: '#FFF0F3', padding: 24, textAlign: 'center', borderBottom: '2px dashed #FFB6C1' },
  ticketBrand: { fontFamily: "'Playfair Display', serif", fontSize: 40, color: '#E8637A', letterSpacing: 6 },
  ticketSub: { color: '#9B7B84', fontSize: 13, marginTop: 4 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '20px 24px', background: '#FAFAFA' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  infoLabel: { fontSize: 11, color: '#9B7B84', textTransform: 'uppercase', letterSpacing: 1 },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  addressBox: { margin: '0 24px 20px', background: '#FFF0F3', borderRadius: 12, padding: 16, border: '1px solid #FFB6C1', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6 },
  addressTitle: { fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#E8637A' },
  productsTitle: { padding: '0 24px 12px', fontSize: 16, fontWeight: 600 },
  th: { padding: '10px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#E8637A', textTransform: 'uppercase' },
  td: { padding: '12px 24px', fontSize: 14, borderBottom: '1px solid #F0E0E5' },
  totals: { padding: '16px 24px 8px', display: 'flex', flexDirection: 'column', gap: 8 },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 15 },
  actions: { display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
};
