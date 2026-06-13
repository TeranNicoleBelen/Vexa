import React from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { IconTarget, IconEye, IconDiamond, IconPin, IconPhone, IconEmail, IconClock, IconMap } from '../../components/shared/CosmeticIcons';

export default function AboutPage() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section style={S.hero}>
        <div className="container">
          <div style={S.heroBadge}>Sobre Nosotros</div>
          <h1 style={S.heroTitle}>Somos <span style={S.accent}>VEXA</span></h1>
          <p style={S.heroDesc}>Tu tienda de confianza para productos de limpieza del hogar y cuidado personal en El Alto, Bolivia</p>
        </div>
      </section>

      {/* Mission/Vision */}
      <section style={S.section}>
        <div className="container">
          <div style={S.mvGrid}>
            {[
              { icon: <IconTarget size={52} color="#E8637A" />, title: 'Nuestra Misión', text: 'Proveer productos de limpieza y belleza de alta calidad a precios accesibles, contribuyendo al bienestar y la higiene de los hogares bolivianos con un servicio excepcional y cercano a nuestra comunidad.' },
              { icon: <IconEye size={52} color="#E8637A" />, title: 'Nuestra Visión', text: 'Ser la tienda líder de productos de limpieza y belleza en El Alto y toda Bolivia, reconocida por la calidad de nuestros productos, la confiabilidad de nuestro servicio y nuestro compromiso con la comunidad.' },
              { icon: <IconDiamond size={52} color="#E8637A" />, title: 'Nuestros Valores', text: 'Calidad, honestidad, compromiso con el cliente, innovación constante, responsabilidad social y respeto por el medio ambiente guían cada una de nuestras acciones diarias.' },
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
                ['★★★★★', 'Calidad'],
                ['6', 'Categorías'],
                ['24h', 'Delivery'],
                ['QR + Tarjeta', 'Pagos Flexibles'],
                ['El Alto', 'Bolivia'],
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
                <div style={S.teamAvatar}>{p.avatar}</div>
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
              { icon: <IconPin size={36} color="#FFB6C1" />, title: 'Dirección', lines: ['Mercado Ciudad Satélite', 'El Alto, Bolivia'] },
              { icon: <IconPhone size={36} color="#FFB6C1" />, title: 'Teléfonos', lines: ['+591 60612998', '+591 73503017'] },
              { icon: <IconEmail size={36} color="#FFB6C1" />, title: 'Email', lines: ['terannicole06@gmail.com'] },
              { icon: <IconClock size={36} color="#FFB6C1" />, title: 'Horario', lines: ['Lunes a Viernes: 8:00 – 20:00', 'Sábado: 9:00 – 18:00'] },
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
            <p style={{ color: '#FFB6C1', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <IconPin size={16} color="#FFB6C1" /> Mercado Ciudad Satélite — El Alto, Bolivia
            </p>
            <a
              href="https://maps.google.com/?q=Mercado+Ciudad+Satelite+El+Alto+Bolivia"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#FF8C69', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <IconMap size={16} color="#FF8C69" /> Ver en Google Maps →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function AvatarCEO() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="18" r="10" fill="rgba(232,99,122,0.7)"/>
      <path d="M8 46 Q8 34 25 34 Q42 34 42 46" fill="rgba(232,99,122,0.5)"/>
      <circle cx="25" cy="18" r="6" fill="rgba(255,255,255,0.3)"/>
      {/* lipstick detail */}
      <rect x="38" y="28" width="6" height="12" rx="2" fill="rgba(232,99,122,0.8)"/>
      <path d="M38 28 Q41 24 44 28" fill="rgba(232,99,122,0.9)"/>
    </svg>
  );
}

function AvatarTech() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="18" r="10" fill="rgba(232,99,122,0.6)"/>
      <path d="M8 46 Q8 34 25 34 Q42 34 42 46" fill="rgba(232,99,122,0.4)"/>
      <rect x="30" y="28" width="14" height="10" rx="2" fill="rgba(232,99,122,0.7)"/>
      <path d="M32 32 L35 35 L39 30" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function AvatarMkt() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="18" r="10" fill="rgba(255,140,105,0.7)"/>
      <path d="M8 46 Q8 34 25 34 Q42 34 42 46" fill="rgba(255,140,105,0.5)"/>
      {[0,60,120,180,240,300].map((a, i) => (
        <ellipse key={i} cx={42 + 5*Math.cos(a*Math.PI/180)} cy={30 + 5*Math.sin(a*Math.PI/180)} rx="2.5" ry="3.5" fill="rgba(255,182,193,0.7)"
          transform={`rotate(${a}, ${42 + 5*Math.cos(a*Math.PI/180)}, ${30 + 5*Math.sin(a*Math.PI/180)})`}/>
      ))}
      <circle cx="42" cy="30" r="2" fill="rgba(232,99,122,0.8)"/>
    </svg>
  );
}

function AvatarDelivery() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="16" r="9" fill="rgba(232,99,122,0.6)"/>
      <path d="M6 44 Q6 32 22 32 Q34 32 38 38" fill="rgba(232,99,122,0.4)"/>
      <rect x="30" y="26" width="18" height="12" rx="2" fill="rgba(232,99,122,0.7)"/>
      <path d="M30 30 L44 30" stroke="white" strokeWidth="1.2"/>
      <circle cx="33" cy="39" r="2.5" fill="#1A1A1A" stroke="rgba(232,99,122,0.8)" strokeWidth="1.5"/>
      <circle cx="43" cy="39" r="2.5" fill="#1A1A1A" stroke="rgba(232,99,122,0.8)" strokeWidth="1.5"/>
    </svg>
  );
}

const team = [
  { avatar: <AvatarCEO />, name: 'Nicole Terán', role: 'Fundadora & CEO', bio: 'Emprendedora apasionada por la belleza y el cuidado del hogar. Creó VEXA con el sueño de llevar calidad a cada familia de El Alto.' },
  { avatar: <AvatarTech />, name: 'Equipo Técnico', role: 'Tecnología', bio: 'Responsables de nuestra plataforma digital para que puedas comprar fácil y seguro desde cualquier dispositivo.' },
  { avatar: <AvatarMkt />, name: 'Equipo Marketing', role: 'Atención al Cliente', bio: 'Siempre listos para ayudarte, resolver tus dudas y asegurarse de que tu experiencia de compra sea perfecta.' },
  { avatar: <AvatarDelivery />, name: 'Equipo Delivery', role: 'Entregas', bio: 'Llevamos tus productos con cuidado y puntualidad directamente a la puerta de tu hogar en El Alto.' },
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
  mvIcon: { marginBottom: 16, display: 'flex', justifyContent: 'center' },
  mvTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1A1A1A', marginBottom: 12 },
  mvText: { fontSize: 14, color: '#9B7B84', lineHeight: 1.8 },
  storyLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' },
  storyText: {},
  storyPara: { fontSize: 15, color: '#5C3D47', lineHeight: 1.8, marginBottom: 16 },
  storyStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  statBox: { background: 'white', borderRadius: 16, padding: 24, textAlign: 'center', boxShadow: '0 4px 15px rgba(232,99,122,0.08)', display: 'flex', flexDirection: 'column' },
  statNum: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#E8637A' },
  statLabel: { fontSize: 12, color: '#9B7B84', marginTop: 4 },
  teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 },
  teamCard: { background: 'white', borderRadius: 20, padding: 28, textAlign: 'center', boxShadow: '0 4px 15px rgba(232,99,122,0.08)' },
  teamAvatar: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #FFD1DC, #FFDAB9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  teamName: { fontFamily: "'Playfair Display', serif", fontSize: 17, color: '#1A1A1A', marginBottom: 4 },
  teamRole: { fontSize: 12, color: '#E8637A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  teamBio: { fontSize: 13, color: '#9B7B84', lineHeight: 1.6 },
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 },
  contactCard: { textAlign: 'center', padding: 24, background: 'rgba(255,182,193,0.05)', borderRadius: 16, border: '1px solid rgba(255,182,193,0.1)' },
  contactIcon: { marginBottom: 12, display: 'flex', justifyContent: 'center' },
  contactTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#FFB6C1', marginBottom: 10 },
  contactLine: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  mapBox: { textAlign: 'center', marginTop: 40, background: 'rgba(255,182,193,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,182,193,0.1)' },
};
