import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const adminLinks = [
  { section: 'Principal' },
  { to: '/admin', icon: '', label: 'Dashboard' },
  { section: 'Gestión' },
  { to: '/admin/productos', icon: '', label: 'Productos' },
  { to: '/admin/categorias', icon: '', label: 'Categorías' },
  { to: '/admin/usuarios', icon: '', label: 'Usuarios' },
  { to: '/admin/pedidos', icon: '', label: 'Pedidos' },
  { section: 'Análisis' },
  { to: '/admin/estadisticas', icon: '', label: 'Estadísticas' },
  { to: '/admin/logs', icon: '', label: 'Historial / Logs' },
];

const vendedorLinks = [
  { section: 'Principal' },
  { to: '/vendedor', icon: '', label: 'Dashboard' },
  { section: 'Gestión' },
  { to: '/vendedor/productos', icon: '', label: 'Productos' },
  { to: '/vendedor/categorias', icon: '', label: 'Categorías' },
  { to: '/vendedor/pedidos', icon: '', label: 'Pedidos' },
  { section: 'Análisis' },
  { to: '/vendedor/estadisticas', icon: '', label: 'Estadísticas' },
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = user?.rol_nombre === 'admin' ? adminLinks : vendedorLinks;

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>VEXA</h1>
          <p>Panel {user?.rol_nombre === 'admin' ? 'Administrador' : 'Vendedor'}</p>
        </div>

        <nav className="sidebar-nav">
          {links.map((item, i) => {
            if (item.section) {
              return <div key={i} className="sidebar-section">{item.section}</div>;
            }
            const active = location.pathname === item.to;
            return (
              <Link
                key={i}
                to={item.to}
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info bottom */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8637A, #FF8C69)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user?.nombre?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{user?.nombre} {user?.apellido}</div>
              <div style={{ fontSize: 11, color: '#9B7B84' }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/" style={{
              flex: 1, textAlign: 'center', padding: '7px 10px',
              background: 'rgba(255,182,193,0.1)', borderRadius: 6,
              color: '#FFB6C1', fontSize: 12, textDecoration: 'none',
            }}>Tienda</Link>
            <button onClick={handleLogout} style={{
              flex: 1, padding: '7px 10px', background: 'rgba(231,76,60,0.15)',
              border: 'none', borderRadius: 6, color: '#e74c3c',
              fontSize: 12, cursor: 'pointer',
            }}>Salir</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              {title && <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{title}</h2>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#9B7B84' }}>
              Hola, <strong style={{ color: '#E8637A' }}>{user?.nombre}</strong>
            </span>
            <span style={{
              padding: '4px 12px', borderRadius: 20,
              background: user?.rol_nombre === 'admin' ? '#1A1A1A' : '#FFB6C1',
              color: user?.rol_nombre === 'admin' ? 'white' : '#E8637A',
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            }}>
              {user?.rol_nombre}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          {(title || subtitle) && (
            <div style={{ marginBottom: 28 }}>
              {title && <h1 className="page-title">{title}</h1>}
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}