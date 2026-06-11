import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Brand */}
          <div style={styles.col}>
            <h2 style={styles.logo}>VEXA</h2>
            <p style={styles.tagline}>Limpieza & Belleza</p>
            <p style={styles.desc}>
              Tu tienda de confianza para productos de limpieza del hogar y cuidado personal. Calidad y belleza al alcance de todos en El Alto, Bolivia.
            </p>
            <div style={styles.socials}>
              <a href="#" style={styles.social}>📘</a>
              <a href="#" style={styles.social}>📸</a>
              <a href="#" style={styles.social}>🐦</a>
              <a href="#" style={styles.social}>▶️</a>
            </div>
          </div>

          {/* Links */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Tienda</h4>
            <Link to="/tienda" style={styles.link}>Todos los Productos</Link>
            <Link to="/tienda/categoria/1" style={styles.link}>Limpieza del Hogar</Link>
            <Link to="/tienda/categoria/2" style={styles.link}>Cuidado Personal</Link>
            <Link to="/tienda/categoria/3" style={styles.link}>Belleza</Link>
            <Link to="/tienda/categoria/4" style={styles.link}>Cabello</Link>
          </div>

          <div style={styles.col}>
            <h4 style={styles.colTitle}>Empresa</h4>
            <Link to="/nosotros" style={styles.link}>Sobre Nosotros</Link>
            <Link to="/" style={styles.link}>Inicio</Link>
            <Link to="/login" style={styles.link}>Iniciar Sesión</Link>
            <Link to="/registro" style={styles.link}>Registrarse</Link>
          </div>

          {/* Contact */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Contacto</h4>
            <p style={styles.contactItem}>📍 Mercado Ciudad Satélite, El Alto, Bolivia</p>
            <p style={styles.contactItem}>📞 +591 60612998</p>
            <p style={styles.contactItem}>📞 +591 73503017</p>
            <p style={styles.contactItem}>📧 terannicole06@gmail.com</p>
            <p style={styles.contactItem}>⏰ Lun–Sáb: 8:00 – 20:00</p>
            <div style={styles.locationBox}>
              <p style={{ fontSize: 12, color: '#9B7B84', marginBottom: 4 }}>📌 Recogida en tienda</p>
              <p style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 500 }}>Mercado Ciudad Satélite</p>
              <p style={{ fontSize: 11, color: '#9B7B84' }}>El Alto, Bolivia</p>
            </div>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.bottomText}>© 2024 VEXA – Todos los derechos reservados</p>
          <p style={styles.bottomText}>Hecho con ♥ en Bolivia 🇧🇴</p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: '#1A1A1A', color: 'white', paddingTop: 60 },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 40, paddingBottom: 48,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  col: { display: 'flex', flexDirection: 'column', gap: 10 },
  logo: { fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#FFB6C1', letterSpacing: 6, marginBottom: 0 },
  tagline: { fontSize: 11, color: '#9B7B84', letterSpacing: 3, textTransform: 'uppercase' },
  desc: { fontSize: 13, color: '#9B7B84', lineHeight: 1.7, marginTop: 8 },
  socials: { display: 'flex', gap: 12, marginTop: 8 },
  social: { fontSize: 20, textDecoration: 'none', cursor: 'pointer' },
  colTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#FFB6C1', marginBottom: 4, fontWeight: 600 },
  link: { color: '#9B7B84', textDecoration: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif" },
  contactItem: { color: '#9B7B84', fontSize: 13, lineHeight: 1.6 },
  locationBox: {
    background: 'rgba(255,182,193,0.1)', borderRadius: 8, padding: '10px 12px',
    border: '1px solid rgba(255,182,193,0.2)', marginTop: 8,
  },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', flexWrap: 'wrap', gap: 8 },
  bottomText: { fontSize: 12, color: '#5C3D47' },
};
