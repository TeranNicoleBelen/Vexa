import React from 'react';
import { Link } from 'react-router-dom';
import { IconPin, IconPhone, IconEmail, IconClock, IconMap } from './CosmeticIcons';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid} className="footer-grid-wrap">
          {/* Brand */}
          <div style={styles.col}>
            <h2 style={styles.logo}>VEXA</h2>
            <p style={styles.tagline}>Limpieza & Belleza</p>
            <p style={styles.desc}>
              Tu tienda de confianza para productos de limpieza del hogar y cuidado personal. Calidad y belleza al alcance de todos en El Alto, Bolivia.
            </p>
            <div style={styles.socials}>
              <a href="#" style={styles.social}><SocialFB /></a>
              <a href="#" style={styles.social}><SocialIG /></a>
              <a href="#" style={styles.social}><SocialTW /></a>
              <a href="#" style={styles.social}><SocialYT /></a>
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
            <p style={styles.contactItem}><IconPin size={14} color="#9B7B84" /> Mercado Ciudad Satélite, El Alto, Bolivia</p>
            <p style={styles.contactItem}><IconPhone size={14} color="#9B7B84" /> +591 60612998</p>
            <p style={styles.contactItem}><IconPhone size={14} color="#9B7B84" /> +591 73503017</p>
            <p style={styles.contactItem}><IconEmail size={14} color="#9B7B84" /> terannicole06@gmail.com</p>
            <p style={styles.contactItem}><IconClock size={14} color="#9B7B84" /> Lun–Sáb: 8:00 – 20:00</p>
            <div style={styles.locationBox}>
              <p style={{ fontSize: 12, color: '#9B7B84', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconMap size={12} color="#9B7B84" /> Recogida en tienda
              </p>
              <p style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 500 }}>Mercado Ciudad Satélite</p>
              <p style={{ fontSize: 11, color: '#9B7B84' }}>El Alto, Bolivia</p>
            </div>
          </div>
        </div>

        <div style={styles.bottom} className="footer-bottom-wrap">
          <p style={styles.bottomText}>© 2026 VEXA – Todos los derechos reservados</p>
          <p style={styles.bottomText}>Hecho por Teran Nicole Belen</p>
        </div>
      </div>
    </footer>
  );
}

function SocialFB() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="4" fill="rgba(255,182,193,0.15)"/>
      <path d="M11.5 7H13V5H11.5C10.1 5 9 6.1 9 7.5V9H7.5V11H9V16H11V11H12.5L13 9H11V7.5C11 7.2 11.2 7 11.5 7Z" fill="#9B7B84"/>
    </svg>
  );
}

function SocialIG() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="4" fill="rgba(255,182,193,0.15)"/>
      <rect x="5" y="5" width="10" height="10" rx="3" stroke="#9B7B84" strokeWidth="1.2" fill="none"/>
      <circle cx="10" cy="10" r="2.5" stroke="#9B7B84" strokeWidth="1.2" fill="none"/>
      <circle cx="13.5" cy="6.5" r="0.8" fill="#9B7B84"/>
    </svg>
  );
}

function SocialTW() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="4" fill="rgba(255,182,193,0.15)"/>
      <path d="M15 6.5C14.5 6.8 14 7 13.4 7.1C13 6.7 12.4 6.5 11.8 6.5C10.5 6.5 9.5 7.5 9.5 8.8V9.3C7.5 9.3 5.8 8.3 4.7 6.8C4.4 7.3 4.3 7.9 4.3 8.5C4.3 9.6 4.9 10.5 5.7 11C5.3 11 4.9 10.9 4.5 10.7V10.7C4.5 11.9 5.3 12.9 6.4 13.1C6.1 13.2 5.7 13.2 5.4 13.1C5.7 14.1 6.6 14.8 7.7 14.8C6.8 15.5 5.7 15.9 4.5 15.9C4.3 15.9 4.1 15.9 3.9 15.8C5 16.6 6.3 17 7.8 17C12 17 14.3 13.2 14.3 9.9C14.3 9.8 14.3 9.7 14.3 9.6C14.8 9.3 15.2 8.9 15.5 8.4C15 8.7 14.5 8.8 14 8.9C14.5 8.5 15 7.9 15 6.5Z" fill="#9B7B84"/>
    </svg>
  );
}

function SocialYT() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="4" fill="rgba(255,182,193,0.15)"/>
      <rect x="3" y="6" width="14" height="9" rx="2" stroke="#9B7B84" strokeWidth="1.2" fill="none"/>
      <path d="M8 8 L13 10.5 L8 13 Z" fill="#9B7B84"/>
    </svg>
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
  socials: { display: 'flex', gap: 10, marginTop: 8 },
  social: { textDecoration: 'none', cursor: 'pointer', display: 'flex' },
  colTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#FFB6C1', marginBottom: 4, fontWeight: 600 },
  link: { color: '#9B7B84', textDecoration: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif" },
  contactItem: { color: '#9B7B84', fontSize: 13, lineHeight: 1.6, display: 'flex', alignItems: 'center', gap: 6 },
  locationBox: {
    background: 'rgba(255,182,193,0.1)', borderRadius: 8, padding: '10px 12px',
    border: '1px solid rgba(255,182,193,0.2)', marginTop: 8,
  },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', flexWrap: 'wrap', gap: 8 },
  bottomText: { fontSize: 12, color: '#5C3D47' },
};
