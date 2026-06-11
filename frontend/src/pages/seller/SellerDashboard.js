import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { statsService } from '../../utils/api';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsService.getDashboard(), statsService.getVentasPorMes()])
      .then(([s, v]) => { setStats(s.data.data); setVentas(v.data.data || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout title="Panel Vendedor"><div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div></AdminLayout>;

  const ventasChart = {
    labels: ventas.map(v => v.label),
    datasets: [{ label: 'Ingresos (Bs)', data: ventas.map(v => parseFloat(v.ingresos || 0)), backgroundColor: 'rgba(232,99,122,0.7)', borderColor: '#E8637A', borderWidth: 2, borderRadius: 8 }],
  };

  return (
    <AdminLayout title="Panel Vendedor" subtitle="Resumen de ventas y operaciones">
      <div className="stats-grid">
        {[
          { icon: '💰', label: 'Ingresos Totales', value: `Bs ${parseFloat(stats?.ingresos || 0).toFixed(2)}`, cls: 'pink' },
          { icon: '📦', label: 'Pedidos Totales', value: stats?.totalVentas || 0, cls: 'coral' },
          { icon: '🛍️', label: 'Productos Activos', value: stats?.totalProductos || 0, cls: 'green' },
          { icon: '⏳', label: 'Pendientes', value: stats?.totalPendientes || 0, cls: 'blue' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 15px rgba(232,99,122,0.08)', marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Ingresos por Mes</h3>
        {ventas.length > 0
          ? <Bar data={ventasChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          : <p style={{ color: '#9B7B84', textAlign: 'center', padding: 40 }}>Aún no hay datos de ventas</p>}
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 15px rgba(232,99,122,0.08)' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}>⚡ Acciones Rápidas</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/vendedor/productos" className="btn btn-secondary btn-sm">🛍️ Gestionar Productos</Link>
          <Link to="/vendedor/categorias" className="btn btn-secondary btn-sm">🏷️ Categorías</Link>
          <Link to="/vendedor/pedidos" className="btn btn-secondary btn-sm">📦 Ver Pedidos</Link>
          <Link to="/vendedor/estadisticas" className="btn btn-secondary btn-sm">📈 Estadísticas</Link>
        </div>
      </div>
    </AdminLayout>
  );
}
