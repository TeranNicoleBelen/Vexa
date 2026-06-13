import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { IconCart, IconAdmin, IconStore, IconLogout, IconBox, IconKey, IconHome, IconShop } from './CosmeticIcons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <LogoIcon />
          <div>
            <span style={styles.logoText}>VEXA</span>
            <span style={styles.logoSub}>Limpieza & Belleza</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={styles.links}>
          <Link to="/" style={styles.link(location.pathname === '/')}>Inicio</Link>
          <Link to="/tienda" style={styles.link(location.pathname.startsWith('/tienda'))}>Tienda</Link>
          <Link to="/nosotros" style={styles.link(location.pathname === '/nosotros')}>Nosotros</Link>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {user ? (
            <>
              {user.rol_nombre === 'cliente' && (
                <Link to="/carrito" style={styles.cartBtn}>
                  <IconCart size={22} color="#E8637A" />
                  {count > 0 && <span style={styles.cartBadge}>{count}</span>}
                </Link>
              )}
              <div style={{ position: 'relative' }}>
                <button
                  style={styles.userBtn}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span style={styles.avatar}>{user.nombre?.[0]?.toUpperCase()}</span>
                  <span style={styles.userName}>{user.nombre}</span>
                  <span>▾</span>
                </button>
                {userMenuOpen && (
                  <div style={styles.dropdown}>
                    <div style={styles.dropdownHeader}>
                      <strong>{user.nombre} {user.apellido}</strong>
                      <small style={{ color: '#999' }}>{user.rol_nombre}</small>
                    </div>
                    {user.rol_nombre === 'cliente' && (
                      <Link to="/mis-pedidos" style={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <IconBox size={16} color="#E8637A" /> Mis Pedidos
                      </Link>
                    )}
                    {user.rol_nombre === 'admin' && (
                      <Link to="/admin" style={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <IconAdmin size={16} color="#E8637A" /> Panel Admin
                      </Link>
                    )}
                    {user.rol_nombre === 'vendedor' && (
                      <Link to="/vendedor" style={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <IconStore size={16} color="#E8637A" /> Panel Vendedor
                      </Link>
                    )}
                    <button style={{ ...styles.dropdownItem, color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }} onClick={handleLogout}>
                      <IconLogout size={16} color="#e74c3c" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/login" style={styles.btnSecondary}>Iniciar Sesión</Link>
              <Link to="/registro" style={styles.btnPrimary}>Registrarse</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <IconHome size={18} color="#E8637A" /> Inicio
          </Link>
          <Link to="/tienda" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <IconShop size={18} color="#E8637A" /> Tienda
          </Link>
          <Link to="/nosotros" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <NosotrosIcon /> Nosotros
          </Link>
          {user ? (
            <>
              {user.rol_nombre === 'cliente' && <Link to="/carrito" style={styles.mobileLink} onClick={() => setMenuOpen(false)}><IconCart size={18} color="#E8637A" /> Carrito ({count})</Link>}
              {user.rol_nombre === 'cliente' && <Link to="/mis-pedidos" style={styles.mobileLink} onClick={() => setMenuOpen(false)}><IconBox size={18} color="#E8637A" /> Mis Pedidos</Link>}
              {user.rol_nombre === 'admin' && <Link to="/admin" style={styles.mobileLink} onClick={() => setMenuOpen(false)}><IconAdmin size={18} color="#E8637A" /> Admin</Link>}
              {user.rol_nombre === 'vendedor' && <Link to="/vendedor" style={styles.mobileLink} onClick={() => setMenuOpen(false)}><IconStore size={18} color="#E8637A" /> Vendedor</Link>}
              <button style={{ ...styles.mobileLink, border: 'none', background: 'none', color: '#e74c3c', textAlign: 'left', cursor: 'pointer' }} onClick={handleLogout}>
                <IconLogout size={18} color="#e74c3c" /> Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}><IconKey size={18} color="#E8637A" /> Iniciar Sesión</Link>
              <Link to="/registro" style={styles.mobileLink} onClick={() => setMenuOpen(false)}><RegisterIcon /> Registrarse</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
      <rect x="10" y="14" width="12" height="16" rx="3" fill="#E8637A" opacity="0.85"/>
      <rect x="13" y="8" width="6" height="8" rx="2" fill="#E8637A"/>
      <rect x="14" y="5" width="4" height="5" rx="1.5" fill="#FFB6C1"/>
      <rect x="12" y="4" width="8" height="2.5" rx="1.25" fill="#E8637A" opacity="0.6"/>
      <ellipse cx="16" cy="20" rx="4" ry="3" fill="rgba(255,255,255,0.12)"/>
    </svg>
  );
}

function NosotrosIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="6" r="3.5" fill="#E8637A" opacity="0.85"/>
      <path d="M2 16 Q2 11 9 11 Q16 11 16 16" fill="#E8637A" opacity="0.6"/>
    </svg>
  );
}

function RegisterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="6" r="3" fill="#E8637A" opacity="0.85"/>
      <path d="M1 16 Q1 11 7 11 Q10 11 12 13" fill="#E8637A" opacity="0.6"/>
      <path d="M13 9 L17 9 M15 7 L15 11" stroke="#E8637A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const styles = {
  nav: {
    background: 'white',
    boxShadow: '0 2px 20px rgba(232,99,122,0.12)',
    position: 'sticky',
    top: 0,
    zIndex: 200,
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
  },
  logo: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#E8637A',
    letterSpacing: 4,
    display: 'block',
  },
  logoSub: {
    fontSize: 10,
    color: '#9B7B84',
    letterSpacing: 2,
    textTransform: 'uppercase',
    display: 'block',
  },
  links: {
    display: 'flex',
    gap: 32,
  },
  link: (active) => ({
    textDecoration: 'none',
    color: active ? '#E8637A' : '#1A1A1A',
    fontWeight: active ? 600 : 400,
    fontSize: 15,
    fontFamily: "'Poppins', sans-serif",
    borderBottom: active ? '2px solid #E8637A' : '2px solid transparent',
    paddingBottom: 2,
    transition: 'all 0.2s',
  }),
  actions: { display: 'flex', alignItems: 'center', gap: 12 },
  cartBtn: {
    position: 'relative',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    background: '#E8637A',
    color: 'white',
    borderRadius: '50%',
    width: 18,
    height: 18,
    fontSize: 11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: '2px solid #FFB6C1',
    borderRadius: 30,
    padding: '6px 14px 6px 8px',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14,
    color: '#1A1A1A',
    transition: 'all 0.2s',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #E8637A, #FF8C69)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 13,
  },
  userName: { fontWeight: 500 },
  dropdown: {
    position: 'absolute',
    top: '110%',
    right: 0,
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    minWidth: 200,
    overflow: 'hidden',
    zIndex: 300,
    animation: 'fadeIn 0.2s ease',
  },
  dropdownHeader: {
    padding: '16px 16px 8px',
    display: 'flex',
    flexDirection: 'column',
    borderBottom: '1px solid #F0E0E5',
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    textDecoration: 'none',
    color: '#1A1A1A',
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    transition: 'background 0.15s',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #E8637A, #FF8C69)',
    color: 'white',
    padding: '9px 20px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
  },
  btnSecondary: {
    border: '2px solid #E8637A',
    color: '#E8637A',
    padding: '7px 20px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: 22,
    cursor: 'pointer',
    color: '#1A1A1A',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    borderTop: '1px solid #F0E0E5',
    padding: 8,
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 20px',
    textDecoration: 'none',
    color: '#1A1A1A',
    fontSize: 15,
    fontFamily: "'Poppins', sans-serif",
    borderRadius: 8,
    transition: 'background 0.15s',
  },
};
