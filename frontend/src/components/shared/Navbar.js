import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

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

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoText}>VEXA</span>
          <span style={styles.logoSub}>Limpieza & Belleza</span>
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
                  🛒
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
                        📦 Mis Pedidos
                      </Link>
                    )}
                    {user.rol_nombre === 'admin' && (
                      <Link to="/admin" style={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        ⚙️ Panel Admin
                      </Link>
                    )}
                    {user.rol_nombre === 'vendedor' && (
                      <Link to="/vendedor" style={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        🏪 Panel Vendedor
                      </Link>
                    )}
                    <button style={{ ...styles.dropdownItem, color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }} onClick={handleLogout}>
                      🚪 Cerrar Sesión
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
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🏠 Inicio</Link>
          <Link to="/tienda" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🛍️ Tienda</Link>
          <Link to="/nosotros" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>💼 Nosotros</Link>
          {user ? (
            <>
              {user.rol_nombre === 'cliente' && <Link to="/carrito" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🛒 Carrito ({count})</Link>}
              {user.rol_nombre === 'cliente' && <Link to="/mis-pedidos" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📦 Mis Pedidos</Link>}
              {user.rol_nombre === 'admin' && <Link to="/admin" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>⚙️ Admin</Link>}
              {user.rol_nombre === 'vendedor' && <Link to="/vendedor" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🏪 Vendedor</Link>}
              <button style={{ ...styles.mobileLink, border: 'none', background: 'none', color: '#e74c3c', textAlign: 'left', cursor: 'pointer' }} onClick={handleLogout}>🚪 Cerrar Sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🔑 Iniciar Sesión</Link>
              <Link to="/registro" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>✨ Registrarse</Link>
            </>
          )}
        </div>
      )}
    </nav>
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
    flexDirection: 'column',
    lineHeight: 1.1,
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#E8637A',
    letterSpacing: 4,
  },
  logoSub: {
    fontSize: 10,
    color: '#9B7B84',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  links: {
    display: 'flex',
    gap: 32,
    '@media (max-width: 768px)': { display: 'none' },
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
    fontSize: 22,
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    transition: 'all 0.2s',
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
    display: 'block',
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
    '@media (max-width: 768px)': { display: 'block' },
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    borderTop: '1px solid #F0E0E5',
    padding: 8,
  },
  mobileLink: {
    display: 'block',
    padding: '12px 20px',
    textDecoration: 'none',
    color: '#1A1A1A',
    fontSize: 15,
    fontFamily: "'Poppins', sans-serif",
    borderRadius: 8,
    transition: 'background 0.15s',
  },
};
