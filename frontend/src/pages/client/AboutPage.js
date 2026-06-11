import React from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';

export default function AboutPage() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section style={S.hero}>
        <div className="container">
          <div style={S.heroBadge}>💼 Sobre Nosotros</div>
          <h1 style={S.heroTitle}>Somos <span style={S.accent}>VEXA</span></h1>
          <p style={S.heroDesc}>Tu tienda de confianza para productos de limpieza del hogar y cuidado personal en El Alto, Bolivia</p>
        </div>
      </section>

      {/* Mission/Vision */}
      <section style={S.section}>
        <div className="container">
          <div style={S.mvGrid}>
            {[
              { icon: '🎯', title: 'Nuestra Misión', text: 'Proveer productos de limpieza y belleza de alta calidad a precios accesibles, contribuyendo al bienestar y la higiene de los hogares bolivianos con un servicio excepcional y cercano a nuestra comunidad.' },
              { icon: '🔭', title: 'Nuestra Visión', text: 'Ser la tienda líder de productos de limpieza y belleza en El Alto y toda Bolivia, reconocida por la calidad de nuestros productos, la confiabilidad de nuestro servicio y nuestro compromiso con la comunidad.' },
              { icon: '💎', title: 'Nuestros Valores', text: 'Calidad, honestidad, compromiso con el cliente, innovación constante, responsabilidad social y respeto por el medio ambiente guían cada una de nuestras acciones diarias.' },
            ].map(item => (
              <div key={item.title} style={S.mvCard}>
                <div style={S.mvIcon}>{item.icon}</div>
                <h3 style={S.mvTitle}>{item.title}</h3>
                <p style={S.mvText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section style={{ ...S.section, background: '#FDF5F7' }}>
        <div className="container">
          <div style={S.storyLayout}>
            <div style={S.storyText}>
              <h2 style={S.sectionTitle}>Nuestra Historia</h2>
              <p style={S.storyPara}>VEXA nació como un emprendimiento apasionado en el corazón del Mercado Ciudad Satélite de El Alto, Bolivia, con la visión de hacer accesibles los mejores productos de limpieza y belleza para todos los hogares de nuestra ciudad.</p>
              <p style={S.storyPara}>Lo que comenzó como una pequeña tienda en el mercado, creció rápidamente gracias a la confianza de nuestra comunidad y la calidad garantizada de nuestros productos. Hoy expandimos nuestra presencia al mundo digital para llegar a más familias bolivianas.</p>
              <p style={S.storyPara}>En VEXA creemos que cada hogar merece productos de calidad y cada persona merece sentirse bien. Por eso trabajamos día a día para ofrecerte lo mejor al mejor precio.</p>
            </div>
            <div style={S.storyStats}>
              {[
                ['500+', 'Productos'],
                ['🌟', 'Calidad'],
                ['6', 'Categorías'],
                ['🚚', 'Delivery'],
                ['💳', 'Pagos Flexibles'],
                ['❤️', 'El Alto'],
              ].map(([n, l]) => (
                <div key={l} style={S.statBox}>
                  <strong style={S.statNum}>{n}</strong>
                  <span style={S.statLabel}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={S.section}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={S.sectionTitle}>Nuestro Equipo</h2>
            <p style={{ color: '#9B7B84', fontSize: 16 }}>Las personas detrás de VEXA</p>
          </div>
          <div style={S.teamGrid}>
            {team.map(p => (
              <div key={p.name} style={S.teamCard}>
                <div style={S.teamAvatar}>{p.emoji}</div>
                <h3 style={S.teamName}>{p.name}</h3>
                <p style={S.teamRole}>{p.role}</p>
                <p style={S.teamBio}>{p.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section style={{ ...S.section, background: '#1A1A1A' }}>
        <div className="container">
          <h2 style={{ ...S.sectionTitle, color: '#FFB6C1', textAlign: 'center', marginBottom: 40 }}>Encuéntranos</h2>
          <div style={S.contactGrid}>
            {[
              { icon: '📍', title: 'Dirección', lines: ['Mercado Ciudad Satélite', 'El Alto, Bolivia'] },
              { icon: '📞', title: 'Teléfonos', lines: ['+591 60612998', '+591 73503017'] },
              { icon: '📧', title: 'Email', lines: ['terannicole06@gmail.com'] },
              { icon: '⏰', title: 'Horario', lines: ['Lunes a Viernes: 8:00 – 20:00', 'Sábado: 9:00 – 18:00'] },
            ].map(c => (
              <div key={c.title} style={S.contactCard}>
                <div style={S.contactIcon}>{c.icon}</div>
                <h3 style={S.contactTitle}>{c.title}</h3>
                {c.lines.map(l => <p key={l} style={S.contactLine}>{l}</p>)}
              </div>
            ))}
          </div>

          {/* Map placeholder */}
          <div style={S.mapBox}>
            <p style={{ color: '#FFB6C1', fontWeight: 600, marginBottom: 8 }}>📍 Mercado Ciudad Satélite — El Alto, Bolivia</p>
            <a
              href="https://maps.google.com/?q=Mercado+Ciudad+Satelite+El+Alto+Bolivia"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#FF8C69', fontSize: 14, textDecoration: 'none' }}
            >
              🗺️ Ver en Google Maps →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const team = [
  { emoji: '👩‍💼', name: 'Nicole Terán', role: 'Fundadora & CEO', bio: 'Emprendedora apasionada por la belleza y el cuidado del hogar. Creó VEXA con el sueño de llevar calidad a cada familia de El Alto.' },
  { emoji: '👨‍💻', name: 'Equipo Técnico', role: 'Tecnología', bio: 'Responsables de nuestra plataforma digital para que puedas comprar fácil y seguro desde cualquier dispositivo.' },
  { emoji: '👩‍🎨', name: 'Equipo Marketing', role: 'Atención al Cliente', bio: 'Siempre listos para ayudarte, resolver tus dudas y asegurarse de que tu experiencia de compra sea perfecta.' },
  { emoji: '🚚', name: 'Equipo Delivery', role: 'Entregas', bio: 'Llevamos tus productos con cuidado y puntualidad directamente a la puerta de tu hogar en El Alto.' },
];

const S = {
  hero: { background: 'linear-gradient(135deg, #1A1A1A, #3D1A24)', padding: '100px 0 80px', textAlign: 'center' },
  heroBadge: { display: 'inline-block', background: 'rgba(255,182,193,0.15)', color: '#FFB6C1', padding: '8px 20px', borderRadius: 30, fontSize: 13, marginBottom: 20 },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: 64, color: 'white', marginBottom: 20 },
  accent: { background: 'linear-gradient(135deg, #FFB6C1, #FF8C69)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroDesc: { fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto' },
  section: { padding: '80px 0' },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 36, color: '#1A1A1A', marginBottom: 16 },
  mvGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 },
  mvCard: { background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(232,99,122,0.08)', textAlign: 'center' },
  mvIcon: { fontSize: 52, marginBottom: 16 },
  mvTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1A1A1A', marginBottom: 12 },
  mvText: { fontSize: 14, color: '#9B7B84', lineHeight: 1.8 },
  storyLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' },
  storyText: {},
  storyPara: { fontSize: 15, color: '#5C3D47', lineHeight: 1.8, marginBottom: 16 },
  storyStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  statBox: { background: 'white', borderRadius: 16, padding: 24, textAlign: 'center', boxShadow: '0 4px 15px rgba(232,99,122,0.08)', display: 'flex', flexDirection: 'column' },
  statNum: { fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#E8637A' },
  statLabel: { fontSize: 12, color: '#9B7B84', marginTop: 4 },
  teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 },
  teamCard: { background: 'white', borderRadius: 20, padding: 28, textAlign: 'center', boxShadow: '0 4px 15px rgba(232,99,122,0.08)' },
  teamAvatar: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #FFD1DC, #FFDAB9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 16px' },
  teamName: { fontFamily: "'Playfair Display', serif", fontSize: 17, color: '#1A1A1A', marginBottom: 4 },
  teamRole: { fontSize: 12, color: '#E8637A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  teamBio: { fontSize: 13, color: '#9B7B84', lineHeight: 1.6 },
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 },
  contactCard: { textAlign: 'center', padding: 24, background: 'rgba(255,182,193,0.05)', borderRadius: 16, border: '1px solid rgba(255,182,193,0.1)' },
  contactIcon: { fontSize: 40, marginBottom: 12 },
  contactTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#FFB6C1', marginBottom: 10 },
  contactLine: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  mapBox: { textAlign: 'center', marginTop: 40, background: 'rgba(255,182,193,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,182,193,0.1)' },
};
