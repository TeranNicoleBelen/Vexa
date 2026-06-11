import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CartPage() {
  const { items, total, updateItem, removeItem, loading } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <h1 style={S.title}>🛒 Mi Carrito</h1>
        {items.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 80 }}>🛒</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Tu carrito está vacío</h2>
            <p style={{ color: '#9B7B84', marginBottom: 24 }}>Agrega productos desde la tienda</p>
            <Link to="/tienda" className="btn btn-primary btn-lg">Ir a la Tienda</Link>
          </div>
        ) : (
          <div style={S.layout}>
            <div style={{ flex: 1 }}>
              {items.map(item => (
                <CartItem key={item.id} item={item} onUpdate={updateItem} onRemove={removeItem} />
              ))}
            </div>
            <div style={S.summary}>
              <h2 style={S.summaryTitle}>Resumen del Pedido</h2>
              <div style={S.summaryRow}>
                <span>Subtotal ({items.length} productos):</span>
                <strong>Bs {total.toFixed(2)}</strong>
              </div>
              <div style={S.summaryRow}>
                <span>Costo de envío:</span>
                <strong style={{ color: total >= 200 ? '#27ae60' : '#E8637A' }}>
                  {total >= 200 ? '¡Gratis!' : 'Bs 15.00'}
                </strong>
              </div>
              {total < 200 && (
                <div style={S.promoInfo}>
                  💡 Agrega <strong>Bs {(200 - total).toFixed(2)}</strong> más para envío gratis
                </div>
              )}
              <div style={S.divider} />
              <div style={S.totalRow}>
                <span>Total:</span>
                <strong>Bs {(total + (total >= 200 ? 0 : 15)).toFixed(2)}</strong>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: 16, fontSize: 16, marginTop: 16 }} onClick={() => navigate('/checkout')}>
                Proceder al Pago →
              </button>
              <Link to="/tienda" style={S.continueLink}>← Seguir comprando</Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function CartItem({ item, onUpdate, onRemove }) {
  const handleRemove = async () => {
    await onRemove(item.id);
    toast.info('Producto eliminado');
  };
  return (
    <div style={S.item}>
      <div style={S.itemImg}>
        {item.imagen
          ? <img src={`${API_BASE}${item.imagen}`} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #FFD1DC, #FFDAB9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🧴</div>
        }
      </div>
      <div style={S.itemInfo}>
        <h3 style={S.itemName}>{item.nombre}</h3>
        <p style={S.itemPrice}>Bs {parseFloat(item.precio).toFixed(2)} c/u</p>
      </div>
      <div style={S.itemControls}>
        <button style={S.qtyBtn} onClick={() => onUpdate(item.id, item.cantidad - 1)} disabled={item.cantidad <= 1}>−</button>
        <span style={S.qty}>{item.cantidad}</span>
        <button style={S.qtyBtn} onClick={() => onUpdate(item.id, item.cantidad + 1)} disabled={item.cantidad >= item.stock}>+</button>
      </div>
      <strong style={{ color: '#E8637A', fontSize: 18, minWidth: 80, textAlign: 'right' }}>
        Bs {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
      </strong>
      <button onClick={handleRemove} style={S.removeBtn} title="Eliminar">✕</button>
    </div>
  );
}

const S = {
  title: { fontFamily: "'Playfair Display', serif", fontSize: 36, marginBottom: 32 },
  empty: { textAlign: 'center', padding: '80px 20px' },
  layout: { display: 'flex', gap: 32, alignItems: 'flex-start' },
  item: {
    display: 'flex', alignItems: 'center', gap: 20,
    background: 'white', borderRadius: 16, padding: 20,
    boxShadow: '0 4px 15px rgba(232,99,122,0.08)', marginBottom: 16,
  },
  itemImg: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  itemPrice: { fontSize: 13, color: '#9B7B84' },
  itemControls: { display: 'flex', alignItems: 'center', gap: 12, background: '#F9F0F3', borderRadius: 30, padding: '6px 14px' },
  qtyBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#E8637A', fontWeight: 700 },
  qty: { fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center' },
  removeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9B7B84', padding: 4 },
  summary: {
    width: 340, background: 'white', borderRadius: 16,
    padding: 28, boxShadow: '0 4px 15px rgba(232,99,122,0.08)',
    position: 'sticky', top: 90, flexShrink: 0,
  },
  summaryTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 20 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15 },
  promoInfo: { background: '#FFF0F3', borderRadius: 8, padding: 12, fontSize: 13, color: '#E8637A', marginTop: 8 },
  divider: { height: 1, background: '#F0E0E5', margin: '16px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700 },
  continueLink: { display: 'block', textAlign: 'center', marginTop: 16, color: '#9B7B84', textDecoration: 'none', fontSize: 14 },
};
