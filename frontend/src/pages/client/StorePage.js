import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { productosService, categoriasService } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Estructura de subcategorías por categoría principal
const subcategoriasPor = {
  'Fragancias': ['Fragancias Niños', 'Fragancias Niñas', 'Fragancias Mujeres', 'Fragancias Varones', 'Fragancias Unisex'],
  'Belleza': ['Cuidado Facial', 'Maquillaje', 'Cuidado Corporal', 'Cuidado Capilar', 'Uñas'],
  'Limpieza del Hogar': ['Desinfectantes', 'Lava Vajillas', 'Limpia Pisos', 'Limpia Baños', 'Quitamanchas'],
  'Cuidado Personal': ['Higiene Bucal', 'Jabones y Geles', 'Desodorantes', 'Afeitado', 'Protección Solar'],
  'Aromas': ['Velas Aromáticas', 'Difusores', 'Sahumerios', 'Spray Ambiental', 'Aceites Esenciales'],
  'Bebés': ['Higiene Bebé', 'Cremas Bebé', 'Shampoo Bebé', 'Pañales', 'Accesorios Bebé'],
};

export default function StorePage() {
  const { id: catId } = useParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(catId || '');
  const [expandedCat, setExpandedCat] = useState(null);
  const [selectedSubcat, setSelectedSubcat] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const LIMIT = 12;

  useEffect(() => {
    setSelectedCat(catId || '');
  }, [catId]);

  useEffect(() => {
    categoriasService.getAll({ activo: 1 }).then(r => setCategorias(r.data.data || []));
  }, []);

  useEffect(() => {
    loadProductos();
  }, [selectedCat, page, search]);

  const loadProductos = async () => {
    setLoading(true);
    try {
      const params = { activo: 1, page, limit: LIMIT };
      if (selectedCat) params.categoria_id = selectedCat;
      if (search) params.search = search;
      const res = await productosService.getAll(params);
      setProductos(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleCat = (id) => { setSelectedCat(id); setSelectedSubcat(''); setPage(1); setSidebarOpen(false); };
  const handleCatExpand = (catNombre, catId) => {
    const hasSubs = subcategoriasPor[catNombre];
    if (hasSubs) {
      setExpandedCat(expandedCat === catNombre ? null : catNombre);
    } else {
      handleCat(String(catId));
    }
  };

  const catName = categorias.find(c => String(c.id) === String(selectedCat))?.nombre;
  const displayTitle = selectedSubcat || catName || 'Toda la Tienda';

  return (
    <div>
      <Navbar />

      {/* Header */}
      <div style={S.header}>
        <div className="container">
          <h1 style={S.title}>{displayTitle}</h1>
          <p style={S.subtitle}>{total} productos disponibles</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        {/* Botón para abrir filtros en móvil */}
        <button
          className="store-filter-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={S.filterToggleBtn}
        >
          ☰ Filtrar por categoría {selectedCat && `· ${catName}`}
        </button>

        <div style={S.layout}>
          {/* Sidebar filtros */}
          <aside style={{ ...S.sidebar, ...(sidebarOpen ? S.sidebarOpen : {}) }} className={`store-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Cerrar sidebar en móvil */}
            <button
              className="store-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              style={S.sidebarCloseBtn}
            >✕ Cerrar</button>

            <div style={S.filterCard}>
              <h3 style={S.filterTitle}>Categorías</h3>
              <button
                onClick={() => handleCat('')}
                style={{ ...S.catBtn, ...(selectedCat === '' ? S.catBtnActive : {}) }}
              >
                🛍️ Todos los productos
              </button>
              {categorias.map(cat => {
                const hasSubs = subcategoriasPor[cat.nombre];
                const isExpanded = expandedCat === cat.nombre;
                const isCatActive = String(selectedCat) === String(cat.id);
                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => handleCatExpand(cat.nombre, cat.id)}
                      style={{
                        ...S.catBtn,
                        ...(isCatActive && !selectedSubcat ? S.catBtnActive : {}),
                      }}
                    >
                      <span style={{ ...S.catDot, background: cat.color }} />
                      {cat.nombre}
                      <span style={S.catCount}>{cat.total_productos}</span>
                      {hasSubs && (
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9B7B84' }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                    {/* Subcategorías */}
                    {hasSubs && isExpanded && (
                      <div style={S.subcatList}>
                        <button
                          onClick={() => { handleCat(String(cat.id)); setSelectedSubcat(''); }}
                          style={{
                            ...S.subcatBtn,
                            ...(isCatActive && !selectedSubcat ? S.subcatBtnActive : {}),
                          }}
                        >
                          Ver todos en {cat.nombre}
                        </button>
                        {subcategoriasPor[cat.nombre].map(sub => (
                          <button
                            key={sub}
                            onClick={() => {
                              setSelectedCat(String(cat.id));
                              setSelectedSubcat(sub);
                              setPage(1);
                              setSidebarOpen(false);
                            }}
                            style={{
                              ...S.subcatBtn,
                              ...(selectedSubcat === sub ? S.subcatBtnActive : {}),
                            }}
                          >
                            · {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Overlay sidebar móvil */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={S.sidebarOverlay}
            />
          )}

          {/* Products */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Search */}
            <div style={S.searchBar}>
              <input
                type="text" placeholder="Buscar producto..."
                value={search} onChange={handleSearch}
                style={S.searchInput}
              />
            </div>

            {loading ? (
              <div style={S.prodGrid}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ height: 320, borderRadius: 16 }} className="skeleton" />
                ))}
              </div>
            ) : productos.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 64 }}>🔍</div>
                <h3>No encontramos productos</h3>
                <p style={{ color: '#9B7B84' }}>Prueba con otra búsqueda o categoría</p>
              </div>
            ) : (
              <>
                <div style={S.prodGrid}>
                  {productos.map(prod => <ProductCard key={prod.id} prod={prod} />)}
                </div>
                {/* Pagination */}
                {total > LIMIT && (
                  <div className="pagination">
                    {page > 1 && <button onClick={() => setPage(p => p - 1)}>← Anterior</button>}
                    {[...Array(Math.ceil(total / LIMIT))].map((_, i) => (
                      <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
                    ))}
                    {page < Math.ceil(total / LIMIT) && <button onClick={() => setPage(p => p + 1)}>Siguiente →</button>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ProductCard({ prod }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.rol_nombre !== 'cliente') return toast.info('Solo los clientes pueden agregar al carrito');
    try {
      await addItem(prod.id, 1);
      toast.success('Agregado al carrito ✓');
    } catch { toast.error('Error al agregar'); }
  };

  return (
    <Link to={`/producto/${prod.id}`} style={{ textDecoration: 'none' }}>
      <div style={S.card}>
        <div style={S.imgWrap}>
          {prod.imagen
            ? <img src={`${API_BASE}${prod.imagen}`} alt={prod.nombre} style={S.img} />
            : <div style={S.imgPlaceholder}>🧴</div>
          }
          {prod.stock <= prod.stock_minimo && prod.stock > 0 && (
            <div style={S.stockWarn}>Pocas unidades</div>
          )}
          {prod.stock === 0 && <div style={{ ...S.stockWarn, background: '#e74c3c' }}>Agotado</div>}
        </div>
        <div style={S.cardBody}>
          <span style={S.catLabel}>{prod.categoria_nombre}</span>
          <h3 style={S.prodName}>{prod.nombre}</h3>
          {prod.marca && <p style={S.brand}>{prod.marca}</p>}
          <div style={S.cardFooter}>
            <span style={S.price}>Bs {parseFloat(prod.precio).toFixed(2)}</span>
            <button
              onClick={handleAdd}
              disabled={prod.stock === 0}
              style={{ ...S.addBtn, opacity: prod.stock === 0 ? 0.4 : 1 }}
            >+</button>
          </div>
        </div>
      </div>
    </Link>
  );
}

const S = {
  header: { background: 'linear-gradient(135deg, #FDF5F7, #FFE4E1)', padding: '48px 0 32px' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 6vw, 40px)', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#9B7B84', marginTop: 8 },
  layout: { display: 'flex', gap: 32, alignItems: 'flex-start', position: 'relative' },
  sidebar: {
    width: 240, flexShrink: 0, position: 'sticky', top: 90,
  },
  sidebarOpen: {},
  sidebarOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 199,
  },
  filterToggleBtn: {
    display: 'none',
    width: '100%',
    padding: '12px 16px',
    background: 'white',
    border: '2px solid #FFB6C1',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    color: '#1A1A1A',
    cursor: 'pointer',
    marginBottom: 16,
    textAlign: 'left',
  },
  sidebarCloseBtn: {
    display: 'none',
    width: '100%',
    padding: '10px 16px',
    background: '#F0E0E5',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    color: '#E8637A',
    cursor: 'pointer',
    marginBottom: 12,
    fontWeight: 600,
  },
  filterCard: { background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(232,99,122,0.08)' },
  filterTitle: { fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 16 },
  catBtn: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none',
    cursor: 'pointer', fontSize: 13, color: '#1A1A1A', textAlign: 'left',
    transition: 'all 0.2s', fontFamily: "'Poppins', sans-serif",
    flexWrap: 'wrap',
  },
  catBtnActive: { background: '#FFF0F3', color: '#E8637A', fontWeight: 600 },
  catDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  catCount: { marginLeft: 'auto', fontSize: 11, color: '#9B7B84', background: '#F0E0E5', padding: '2px 6px', borderRadius: 10 },
  subcatList: { paddingLeft: 16, borderLeft: '2px solid #FFB6C1', marginLeft: 12, marginBottom: 4 },
  subcatBtn: {
    display: 'block', width: '100%', padding: '7px 10px',
    background: 'none', border: 'none', borderRadius: 6,
    cursor: 'pointer', fontSize: 12, color: '#5C3D47', textAlign: 'left',
    fontFamily: "'Poppins', sans-serif", transition: 'all 0.2s',
  },
  subcatBtnActive: { background: '#FFF0F3', color: '#E8637A', fontWeight: 600 },
  searchBar: { marginBottom: 24 },
  searchInput: {
    width: '100%', padding: '12px 20px', borderRadius: 30,
    border: '2px solid #FFB6C1', outline: 'none', fontSize: 14,
    fontFamily: "'Poppins', sans-serif", background: 'white',
    boxSizing: 'border-box',
  },
  prodGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
  card: {
    background: 'white', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(232,99,122,0.08)',
    transition: 'all 0.3s', cursor: 'pointer',
  },
  imgWrap: { height: 160, position: 'relative', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  imgPlaceholder: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #FFD1DC, #FFDAB9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50 },
  stockWarn: { position: 'absolute', top: 8, right: 8, background: '#f39c12', color: 'white', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 },
  cardBody: { padding: '12px 14px 14px' },
  catLabel: { fontSize: 10, color: '#E8637A', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 },
  prodName: { fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '4px 0 2px', lineHeight: 1.3 },
  brand: { fontSize: 11, color: '#9B7B84', marginBottom: 8 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 16, fontWeight: 700, color: '#E8637A' },
  addBtn: {
    width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #E8637A, #FF8C69)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white',
  },
  empty: { textAlign: 'center', padding: '80px 20px' },
};
