import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { categoriasService, productosService } from '../../utils/api';
import {
  IconLipstick, IconPerfume, IconCream, IconBrush, IconFlower, IconMirror,
  IconTruck, IconShield, IconCard, IconChat, IconCart
} from '../../components/shared/CosmeticIcons';

export default function HomePage() {
  const [categorias, setCategorias] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [visible, setVisible] = useState({});

  useEffect(() => {
    categoriasService.getAll({ activo: 1 }).then(r => setCategorias(r.data.data || [])).catch(() => {});
    productosService.getAll({ activo: 1, limit: 8 }).then(r => setDestacados(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.id]: true }));
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Navbar />

      {/* HERO */}
      <section style={S.hero}>
        <div style={S.heroBg} />
        <div style={S.heroContent} className="hero-wrap">
          <div style={S.heroText}>
            <span style={S.heroBadge} className="hero-badge-wrap">
              <IconFlower size={14} color="#FFB6C1" />
              &nbsp; Nueva colección 2026
            </span>
            <h1 style={S.heroTitle} className="hero-title-clamp">
              Belleza que<br />
              <span style={S.heroAccent}>transforma</span><br />
              tu vida
            </h1>
            <p style={S.heroDesc}>
              Descubre los mejores productos de limpieza del hogar y cuidado personal. Calidad premium al mejor precio, directo a tu puerta.
            </p>
            <div style={S.heroActions} className="hero-actions-wrap">
              <Link to="/tienda" className="btn btn-primary btn-lg">Ir a la Tienda</Link>
              <Link to="/nosotros" className="btn btn-secondary btn-lg">Conocer más</Link>
            </div>
            <div style={S.heroStats} className="hero-stats-wrap">
              {[['500+', 'Productos'], ['10K+', 'Clientes'], ['5★', 'Calificación'], ['24h', 'Entrega']].map(([n, l]) => (
                <div key={l} style={S.heroStat}>
                  <strong style={S.heroStatNum}>{n}</strong>
                  <span style={S.heroStatLabel}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={S.heroImage} className="hero-img-wrap">
            <div style={S.heroImgCircle}>
              <HeroIllustration />
              <div style={{ ...S.floatingBadge, top: 30, right: -20 }}>
                <IconFlower size={12} color="white" /> Nuevo
              </div>
              <div style={{ ...S.floatingBadge, bottom: 40, left: -20, background: '#FF8C69' }}>
                <IconTruck size={12} color="white" /> Envío gratis
              </div>
            </div>
          </div>
        </div>
        <div style={S.wave}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section style={S.section} id="categorias" data-animate>
        <div className="container">
          <div style={S.sectionHeader} className="section-header-wrap">
            <h2 style={S.sectionTitle}>Nuestras Categorías</h2>
            <p style={S.sectionSub}>Encuentra todo lo que necesitas para tu hogar y cuidado personal</p>
          </div>
          <div style={S.catGrid}>
            {(categorias.length > 0 ? categorias : defaultCats).map((cat, i) => (
              <Link to={`/tienda/categoria/${cat.id}`} key={cat.id} style={{ textDecoration: 'none' }}>
                <div style={{ ...S.catCard, animationDelay: `${i * 0.1}s` }} className="animate-fadeIn">
                  <div style={{ ...S.catIcon, background: cat.color || '#FFB6C1' }}>
                    {catIcons[cat.nombre] || <IconCream size={32} color="white" />}
                  </div>
                  <h3 style={S.catName}>{cat.nombre}</h3>
                  <p style={S.catCount}>{cat.total_productos || 0} productos</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER PROMO */}
      <section style={S.banner}>
        <div className="container">
          <div style={S.bannerContent} className="banner-wrap">
            <div>
              <h2 style={S.bannerTitle}>
                <IconTruck size={28} color="white" style={{ verticalAlign: 'middle', marginRight: 8 }} />
                &nbsp;Envío GRATIS
              </h2>
              <p style={S.bannerDesc}>En pedidos mayores a <strong>200 Bs</strong> dentro de La Paz</p>
            </div>
            <Link to="/tienda" className="btn btn-black btn-lg">Aprovechar ahora</Link>
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section style={S.section}>
        <div className="container">
          <div style={S.sectionHeader} className="section-header-wrap">
            <h2 style={S.sectionTitle}>Productos Destacados</h2>
            <Link to="/tienda" style={{ color: '#E8637A', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Ver todos →</Link>
          </div>
          <div style={S.prodGrid}>
            {destacados.map((prod, i) => (
              <ProductCard key={prod.id} prod={prod} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section style={{ ...S.section, background: '#FDF5F7' }}>
        <div className="container">
          <div style={S.sectionHeader} className="section-header-wrap">
            <h2 style={S.sectionTitle}>¿Por qué elegir VEXA?</h2>
          </div>
          <div style={S.whyGrid}>
            {whyUs.map((item, i) => (
              <div key={i} style={S.whyCard} className="animate-fadeIn">
                <div style={S.whyIcon}>{item.icon}</div>
                <h3 style={S.whyTitle}>{item.title}</h3>
                <p style={S.whyDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={S.cta}>
        <div className="container">
          <div style={S.ctaContent}>
            <h2 style={S.ctaTitle}>¿Lista para comenzar?</h2>
            <p style={S.ctaDesc}>Únete a miles de clientes satisfechos con VEXA</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/registro" className="btn btn-primary btn-lg">Crear cuenta gratis</Link>
              <Link to="/tienda" style={{ ...S.ctaBtn }}>Ver productos →</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function HeroIllustration() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fondo decorativo */}
      <circle cx="100" cy="100" r="90" fill="rgba(255,182,193,0.08)" />
      {/* Frasco de perfume grande */}
      <rect x="70" y="80" width="60" height="80" rx="12" fill="rgba(232,99,122,0.7)"/>
      <rect x="80" y="60" width="40" height="24" rx="6" fill="rgba(232,99,122,0.85)"/>
      <rect x="88" y="48" width="24" height="16" rx="4" fill="rgba(255,182,193,0.9)"/>
      <rect x="82" y="44" width="36" height="8" rx="4" fill="rgba(232,99,122,0.6)"/>
      <ellipse cx="100" cy="110" rx="18" ry="12" fill="rgba(255,255,255,0.12)"/>
      {/* Línea decorativa en frasco */}
      <rect x="76" y="92" width="48" height="2" rx="1" fill="rgba(255,255,255,0.2)"/>
      {/* Etiqueta */}
      <rect x="78" y="100" width="44" height="30" rx="4" fill="rgba(255,255,255,0.15)"/>
      <rect x="84" y="106" width="32" height="3" rx="1.5" fill="rgba(255,255,255,0.4)"/>
      <rect x="88" y="113" width="24" height="2" rx="1" fill="rgba(255,255,255,0.25)"/>
      {/* Lipstick izquierda */}
      <rect x="35" y="100" width="18" height="50" rx="4" fill="rgba(255,140,105,0.8)"/>
      <path d="M35 100 Q44 88 53 100" fill="rgba(255,140,105,0.9)"/>
      <rect x="37" y="108" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.2)"/>
      {/* Lipstick derecha */}
      <rect x="147" y="108" width="18" height="48" rx="4" fill="rgba(255,182,193,0.8)"/>
      <path d="M147 108 Q156 96 165 108" fill="rgba(255,182,193,0.9)"/>
      {/* Flores decorativas */}
      <circle cx="40" cy="70" r="8" fill="rgba(255,182,193,0.4)"/>
      <circle cx="40" cy="58" r="5" fill="rgba(255,182,193,0.3)"/>
      <circle cx="30" cy="66" r="5" fill="rgba(255,182,193,0.3)"/>
      <circle cx="50" cy="66" r="5" fill="rgba(255,182,193,0.3)"/>
      <circle cx="34" cy="78" r="5" fill="rgba(255,182,193,0.3)"/>
      <circle cx="46" cy="78" r="5" fill="rgba(255,182,193,0.3)"/>
      <circle cx="40" cy="70" r="4" fill="rgba(232,99,122,0.6)"/>
      {/* Brillo en perfume */}
      <circle cx="82" cy="72" r="4" fill="rgba(255,255,255,0.3)"/>
      <circle cx="158" cy="60" r="6" fill="rgba(255,182,193,0.3)"/>
      <circle cx="158" cy="51" r="4" fill="rgba(255,182,193,0.2)"/>
      <circle cx="151" cy="57" r="4" fill="rgba(255,182,193,0.2)"/>
      <circle cx="165" cy="57" r="4" fill="rgba(255,182,193,0.2)"/>
      <circle cx="158" cy="60" r="3" fill="rgba(232,99,122,0.5)"/>
    </svg>
  );
}

function ProductCard({ prod, delay }) {
  const API = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return (
    <Link to={`/producto/${prod.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ ...S.prodCard, animationDelay: `${delay}s` }} className="animate-fadeIn">
        <div style={S.prodImgWrap}>
          {prod.imagen
            ? <img src={`${API}${prod.imagen}`} alt={prod.nombre} style={S.prodImg} />
            : <div style={S.prodImgPlaceholder}>
                <CosmeticPlaceholder />
              </div>
          }
          <div style={S.prodBadge}>{prod.categoria_nombre}</div>
        </div>
        <div style={S.prodBody}>
          <p style={S.prodBrand}>{prod.marca}</p>
          <h3 style={S.prodName}>{prod.nombre}</h3>
          <div style={S.prodFooter}>
            <span style={S.prodPrice}>Bs {parseFloat(prod.precio).toFixed(2)}</span>
            <div style={S.addBtn}>
              <IconCart size={16} color="white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CosmeticPlaceholder() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="30" width="24" height="36" rx="6" fill="rgba(232,99,122,0.6)"/>
      <rect x="32" y="20" width="16" height="12" rx="3" fill="rgba(232,99,122,0.7)"/>
      <rect x="35" y="15" width="10" height="8" rx="2" fill="rgba(255,182,193,0.8)"/>
      <ellipse cx="40" cy="44" rx="8" ry="5" fill="rgba(255,255,255,0.15)"/>
    </svg>
  );
}

const catIcons = {
  'Limpieza del Hogar': <IconBrush size={32} color="white" />,
  'Cuidado Personal': <IconCream size={32} color="white" />,
  'Belleza': <IconLipstick size={32} color="white" />,
  'Cabello': <IconBrush size={32} color="white" />,
  'Skin Care': <IconMirror size={32} color="white" />,
  'Fragancias': <IconPerfume size={32} color="white" />,
};

const whyUs = [
  { icon: <IconShield size={44} color="#E8637A" />, title: 'Calidad Garantizada', desc: 'Todos nuestros productos son originales y de las mejores marcas del mercado.' },
  { icon: <IconTruck size={44} color="#E8637A" />, title: 'Envío Rápido', desc: 'Entregamos en 24 horas dentro de La Paz. Envío gratis en pedidos mayores a 200 Bs.' },
  { icon: <IconCard size={44} color="#E8637A" />, title: 'Pago Seguro', desc: 'Acepta QR, tarjeta de crédito/débito y efectivo en tienda.' },
  { icon: <IconChat size={44} color="#E8637A" />, title: 'Atención 24/7', desc: 'Nuestro agente virtual Luna está disponible en todo momento para ayudarte.' },
];

const defaultCats = [
  { id: 1, nombre: 'Limpieza del Hogar', color: '#FFB6C1', total_productos: 0 },
  { id: 2, nombre: 'Cuidado Personal', color: '#FF8C69', total_productos: 0 },
  { id: 3, nombre: 'Belleza', color: '#FFD1DC', total_productos: 0 },
  { id: 4, nombre: 'Cabello', color: '#FFC0CB', total_productos: 0 },
  { id: 5, nombre: 'Skin Care', color: '#FFDAB9', total_productos: 0 },
  { id: 6, nombre: 'Fragancias', color: '#FFE4E1', total_productos: 0 },
];

const S = {
  hero: {
    background: 'linear-gradient(135deg, #1A1A1A 0%, #3D1A24 60%, #5C2D3A 100%)',
    minHeight: '90vh', position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,182,193,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,140,105,0.08) 0%, transparent 50%)',
  },
  heroContent: {
    maxWidth: 1200, margin: '0 auto', padding: '100px 24px 120px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 60,
    width: '100%', position: 'relative', zIndex: 2,
  },
  heroText: { flex: 1, maxWidth: 560 },
  heroBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,182,193,0.15)',
    color: '#FFB6C1', padding: '8px 18px', borderRadius: 30, fontSize: 13,
    fontWeight: 500, marginBottom: 24, border: '1px solid rgba(255,182,193,0.3)',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: 64, fontWeight: 700,
    color: 'white', lineHeight: 1.1, marginBottom: 24,
  },
  heroAccent: {
    background: 'linear-gradient(135deg, #FFB6C1, #FF8C69)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  heroDesc: { fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 36 },
  heroActions: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 },
  heroStats: { display: 'flex', gap: 32 },
  heroStat: { display: 'flex', flexDirection: 'column' },
  heroStatNum: { fontSize: 28, fontWeight: 700, color: '#FFB6C1' },
  heroStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 },
  heroImage: { flex: 1, display: 'flex', justifyContent: 'center', maxWidth: 400 },
  heroImgCircle: {
    width: 340, height: 340, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,182,193,0.2), rgba(255,140,105,0.1))',
    border: '2px solid rgba(255,182,193,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', animation: 'float 3s ease-in-out infinite',
  },
  floatingBadge: {
    position: 'absolute', background: '#E8637A', color: 'white',
    padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
    boxShadow: '0 4px 15px rgba(232,99,122,0.4)', whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 4,
  },
  wave: { position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 },
  section: { padding: '80px 0', background: 'white' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#1A1A1A' },
  sectionSub: { fontSize: 15, color: '#9B7B84', maxWidth: 500 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 },
  catCard: {
    background: 'white', borderRadius: 16, padding: 24, textAlign: 'center',
    boxShadow: '0 4px 20px rgba(232,99,122,0.08)', cursor: 'pointer',
    transition: 'all 0.3s', border: '2px solid transparent',
  },
  catIcon: { width: 70, height: 70, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  catName: { fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 },
  catCount: { fontSize: 12, color: '#9B7B84' },
  banner: { background: 'linear-gradient(135deg, #E8637A, #FF8C69)', padding: '40px 0' },
  bannerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 },
  bannerTitle: { fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'white', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
  bannerDesc: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  prodGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 24 },
  prodCard: {
    background: 'white', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(232,99,122,0.08)',
    transition: 'all 0.3s', cursor: 'pointer',
  },
  prodImgWrap: { position: 'relative', height: 200, overflow: 'hidden' },
  prodImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' },
  prodImgPlaceholder: {
    width: '100%', height: '100%',
    background: 'linear-gradient(135deg, #FFD1DC, #FFDAB9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  prodBadge: {
    position: 'absolute', top: 12, left: 12,
    background: 'rgba(232,99,122,0.9)', color: 'white',
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
  },
  prodBody: { padding: '16px 20px 20px' },
  prodBrand: { fontSize: 11, color: '#9B7B84', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  prodName: { fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 12, lineHeight: 1.3 },
  prodFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  prodPrice: { fontSize: 20, fontWeight: 700, color: '#E8637A' },
  addBtn: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg, #E8637A, #FF8C69)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  whyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 },
  whyCard: { background: 'white', borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: '0 4px 20px rgba(232,99,122,0.08)' },
  whyIcon: { marginBottom: 16, display: 'flex', justifyContent: 'center' },
  whyTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 },
  whyDesc: { fontSize: 14, color: '#9B7B84', lineHeight: 1.7 },
  cta: { background: 'linear-gradient(135deg, #1A1A1A, #3D1A24)', padding: '80px 0' },
  ctaContent: { textAlign: 'center' },
  ctaTitle: { fontFamily: "'Playfair Display', serif", fontSize: 40, color: 'white', marginBottom: 16 },
  ctaDesc: { fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 40 },
  ctaBtn: { color: '#FFB6C1', fontSize: 16, fontWeight: 500, textDecoration: 'none', padding: '16px 0', display: 'flex', alignItems: 'center' },
};
