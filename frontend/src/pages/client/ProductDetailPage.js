import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { productosService } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productosService.getById(id)
      .then(r => setProduct(r.data.data))
      .catch(() => navigate('/tienda'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!user) return navigate('/login');
    if (user.rol_nombre !== 'cliente') return toast.info('Solo los clientes pueden comprar');
    try {
      await addItem(product.id, cantidad);
      toast.success('Agregado al carrito 🛒');
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (!product) return null;

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <div style={S.breadcrumb}>
          <Link to="/" style={S.blink}>Inicio</Link> ›{' '}
          <Link to="/tienda" style={S.blink}>Tienda</Link> ›{' '}
          <Link to={`/tienda/categoria/${product.categoria_id}`} style={S.blink}>{product.categoria_nombre}</Link> ›{' '}
          <span style={{ color: '#1A1A1A' }}>{product.nombre}</span>
        </div>

        <div style={S.layout}>
          {/* Image */}
          <div style={S.imgSection}>
            <div style={S.imgWrap}>
              {product.imagen
                ? <img src={`${API_BASE}${product.imagen}`} alt={product.nombre} style={S.img} />
                : <div style={S.imgPlaceholder}>🧴</div>
              }
            </div>
          </div>

          {/* Info */}
          <div style={S.info}>
            <span style={S.catBadge}>{product.categoria_nombre}</span>
            {product.marca && <p style={S.brand}>{product.marca}</p>}
            <h1 style={S.name}>{product.nombre}</h1>
            <div style={S.price}>Bs {parseFloat(product.precio).toFixed(2)}</div>
            {product.descripcion && <p style={S.desc}>{product.descripcion}</p>}

            <div style={S.metaGrid}>
              <div style={S.meta}><span>📦 Stock:</span> <strong style={{ color: product.stock > 5 ? '#27ae60' : '#e74c3c' }}>{product.stock} unidades</strong></div>
              {product.codigo && <div style={S.meta}><span>🔖 Código:</span> <strong>{product.codigo}</strong></div>}
            </div>

            {product.stock > 0 ? (
              <>
                <div style={S.cantRow}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Cantidad:</span>
                  <div style={S.cantControls}>
                    <button style={S.cantBtn} onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
                    <span style={S.cantNum}>{cantidad}</span>
                    <button style={S.cantBtn} onClick={() => setCantidad(c => Math.min(product.stock, c + 1))}>+</button>
                  </div>
                </div>
                <button onClick={handleAdd} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
                  🛒 Agregar al Carrito — Bs {(parseFloat(product.precio) * cantidad).toFixed(2)}
                </button>
              </>
            ) : (
              <div style={S.outOfStock}>⚠️ Producto agotado temporalmente</div>
            )}

            <div style={S.promos}>
              <div style={S.promoItem}>🚚 Envío gratis en pedidos mayores a 200 Bs</div>
              <div style={S.promoItem}>💳 Pago con QR, tarjeta o efectivo</div>
              <div style={S.promoItem}>✅ Producto 100% original y garantizado</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const S = {
  breadcrumb: { fontSize: 13, color: '#9B7B84', marginBottom: 32 },
  blink: { color: '#9B7B84', textDecoration: 'none' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' },
  imgSection: {},
  imgWrap: { borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(232,99,122,0.15)', background: '#FDF5F7' },
  img: { width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' },
  imgPlaceholder: { height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, background: 'linear-gradient(135deg, #FFD1DC, #FFDAB9)' },
  info: {},
  catBadge: { display: 'inline-block', background: '#FFF0F3', color: '#E8637A', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 8 },
  brand: { fontSize: 13, color: '#9B7B84', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  name: { fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 16 },
  price: { fontSize: 40, fontWeight: 800, color: '#E8637A', marginBottom: 20 },
  desc: { fontSize: 15, color: '#5C3D47', lineHeight: 1.7, marginBottom: 24 },
  metaGrid: { display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' },
  meta: { fontSize: 14, color: '#9B7B84', display: 'flex', gap: 6 },
  cantRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  cantControls: { display: 'flex', alignItems: 'center', gap: 12, background: '#F9F0F3', borderRadius: 30, padding: '6px 16px' },
  cantBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#E8637A', fontWeight: 700, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cantNum: { fontSize: 18, fontWeight: 700, minWidth: 28, textAlign: 'center' },
  outOfStock: { background: '#F8D7DA', color: '#721C24', padding: '16px 20px', borderRadius: 12, fontSize: 15, marginBottom: 16 },
  promos: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24, borderTop: '1px solid #F0E0E5', paddingTop: 24 },
  promoItem: { fontSize: 13, color: '#5C3D47', display: 'flex', alignItems: 'center', gap: 8 },
};
