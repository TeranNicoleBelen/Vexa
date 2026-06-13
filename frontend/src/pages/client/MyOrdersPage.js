import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { pedidosService, reportesService } from '../../utils/api';

export default function MyOrdersPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pedidosService.getAll().then(r => setPedidos(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const estadoBadge = {
    pendiente: { bg: '#FFF3CD', color: '#856404' },
    confirmado: { bg: '#D1ECF1', color: '#0C5460' },
    en_proceso: { bg: '#FFE0B2', color: '#E65100' },
    enviado: { bg: '#D4EDDA', color: '#155724' },
    entregado: { bg: '#D4EDDA', color: '#155724' },
    cancelado: { bg: '#F8D7DA', color: '#721C24' },
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, marginBottom: 8 }}>Mis Pedidos</h1>
        <p style={{ color: '#9B7B84', marginBottom: 32 }}>Historial de tus compras en VEXA</p>
        {loading ? (
          <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
        ) : pedidos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64 }}></div>
            <h3 style={{ marginBottom: 12 }}>No tienes pedidos aún</h3>
            <Link to="/tienda" className="btn btn-primary btn-lg">Ir a la Tienda</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pedidos.map(p => {
              const badge = estadoBadge[p.estado] || estadoBadge.pendiente;
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 15px rgba(232,99,122,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <strong style={{ fontSize: 16 }}>#{p.codigo_pedido}</strong>
                      <span style={{ ...badge, padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{p.estado}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#9B7B84' }}>
                      {new Date(p.created_at).toLocaleDateString('es-BO')} · {p.metodo_pago.toUpperCase()} · {p.tipo_entrega}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#E8637A' }}>Bs {parseFloat(p.total).toFixed(2)}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <Link to={`/pedido-confirmado/${p.id}`} className="btn btn-secondary btn-sm">Ver detalles</Link>
                      <a href={reportesService.getPedidoPDF(p.id)} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#F0E0E5', color: '#5C3D47' }}>PDF</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
