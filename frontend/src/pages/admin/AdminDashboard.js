import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { statsService } from '../../utils/api';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statsService.getDashboard(),
      statsService.getVentasPorMes(),
      statsService.getVentasPorCategoria(),
    ]).then(([s, v, c]) => {
      setStats(s.data.data);
      setVentas(v.data.data || []);
      setCategorias(c.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div></AdminLayout>;

  const ventasChart = {
    labels: ventas.map(v => v.label),
    datasets: [{
      label: 'Ingresos (Bs)',
      data: ventas.map(v => parseFloat(v.ingresos || 0)),
      backgroundColor: 'rgba(232,99,122,0.7)',
      borderColor: '#E8637A',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const catChart = {
    labels: categorias.map(c => c.categoria),
    datasets: [{
      data: categorias.map(c => c.total_vendido || 0),
      backgroundColor: ['#FFB6C1', '#FF8C69', '#FFD1DC', '#FFC0CB', '#FFDAB9', '#FFE4E1'],
      borderWidth: 0,
    }],
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Resumen general de la tienda">
      {/* Stats cards */}
      <div className="stats-grid">
        {[
          { icon: '', label: 'Ingresos Totales', value: `Bs ${parseFloat(stats?.ingresos || 0).toFixed(2)}`, cls: 'pink' },
          { icon: '', label: 'Pedidos Totales', value: stats?.totalVentas || 0, cls: 'coral' },
          { icon: '', label: 'Productos Activos', value: stats?.totalProductos || 0, cls: 'green' },
          { icon: '', label: 'Clientes', value: stats?.totalClientes || 0, cls: 'blue' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {stats?.totalPendientes > 0 && (
        <div style={{ background: '#FFF3CD', borderRadius: 12, padding: '12px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>! Tienes <strong>{stats.totalPendientes}</strong> pedidos pendientes</span>
          <Link to="/admin/pedidos" style={{ color: '#E8637A', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>Ver pedidos →</Link>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 15px rgba(232,99,122,0.08)' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Ingresos por Mes</h3>
          {ventas.length > 0 ? (
            <Bar data={ventasChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          ) : <p style={{ color: '#9B7B84', textAlign: 'center', padding: 40 }}>No hay datos de ventas aún</p>}
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 15px rgba(232,99,122,0.08)' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Ventas por Categoría</h3>
          {categorias.length > 0 ? (
            <Doughnut data={catChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          ) : <p style={{ color: '#9B7B84', textAlign: 'center', padding: 40 }}>Sin datos aún</p>}
        </div>
      </div>

      {/* Top products + low stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 15px rgba(232,99,122,0.08)' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}> Productos Más Vendidos</h3>
          {(stats?.productosTopVentas || []).length === 0
            ? <p style={{ color: '#9B7B84' }}>Aún no hay ventas registradas</p>
            : (stats?.productosTopVentas || []).map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0E0E5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#E8637A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{p.nombre}</p>
                    <p style={{ fontSize: 12, color: '#9B7B84' }}>{p.categoria}</p>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#E8637A' }}>{p.total_vendido || 0} vendidos</span>
              </div>
            ))
          }
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 15px rgba(232,99,122,0.08)' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}>! Poco Stock</h3>
          {(stats?.productosPocoStock || []).length === 0
            ? <p style={{ color: '#9B7B84' }}>Todos los productos tienen stock suficiente ✓</p>
            : (stats?.productosPocoStock || []).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0E0E5' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{p.nombre}</p>
                  <p style={{ fontSize: 12, color: '#9B7B84' }}>{p.categoria_nombre}</p>
                </div>
                <span style={{ background: p.stock === 0 ? '#F8D7DA' : '#FFF3CD', color: p.stock === 0 ? '#721C24' : '#856404', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  {p.stock} und.
                </span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 15px rgba(232,99,122,0.08)', marginTop: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}> Acciones Rápidas</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { to: '/admin/productos', icon: '', label: 'Nuevo Producto' },
            { to: '/admin/categorias', icon: 'TAG️', label: 'Nueva Categoría' },
            { to: '/admin/usuarios', icon: '', label: 'Gestionar Usuarios' },
            { to: '/admin/pedidos', icon: '', label: 'Ver Pedidos' },
            { to: '/admin/estadisticas', icon: '', label: 'Ver Estadísticas' },
            { to: '/admin/logs', icon: '', label: 'Ver Logs' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="btn btn-secondary btn-sm">{a.icon} {a.label}</Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
