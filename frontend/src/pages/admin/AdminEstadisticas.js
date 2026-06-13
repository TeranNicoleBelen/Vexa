import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { statsService, reportesService } from '../../utils/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const PINK_PALETTE = ['#FFB6C1', '#E8637A', '#FF8C69', '#FFDAB9', '#FFD1DC', '#FFC0CB', '#FFE4E1', '#F08080'];

export default function AdminEstadisticas() {
  const [ventasMes, setVentasMes] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [clientesTop, setClientesTop] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    Promise.all([
      statsService.getVentasPorMes(),
      statsService.getProductosMasVendidos(),
      statsService.getClientesTop(),
      statsService.getVentasPorCategoria(),
    ]).then(([v, p, c, cat]) => {
      setVentasMes(v.data.data || []);
      setProductosMasVendidos(p.data.data || []);
      setClientesTop(c.data.data || []);
      setCategorias(cat.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout title="Estadísticas"><div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div></AdminLayout>;

  const ventasBarChart = {
    labels: ventasMes.map(v => v.label),
    datasets: [
      { label: 'Ingresos (Bs)', data: ventasMes.map(v => parseFloat(v.ingresos || 0)), backgroundColor: 'rgba(232,99,122,0.7)', borderColor: '#E8637A', borderWidth: 2, borderRadius: 8, yAxisID: 'y' },
      { label: 'Pedidos', data: ventasMes.map(v => parseInt(v.total_pedidos || 0)), backgroundColor: 'rgba(255,140,105,0.5)', borderColor: '#FF8C69', borderWidth: 2, borderRadius: 8, yAxisID: 'y1' },
    ],
  };

  const ventasLineChart = {
    labels: ventasMes.map(v => v.label),
    datasets: [{
      label: 'Ingresos mensuales (Bs)',
      data: ventasMes.map(v => parseFloat(v.ingresos || 0)),
      borderColor: '#E8637A',
      backgroundColor: 'rgba(232,99,122,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#E8637A',
      pointRadius: 5,
    }],
  };

  const prodBarChart = {
    labels: productosMasVendidos.map(p => p.nombre.length > 20 ? p.nombre.slice(0, 20) + '...' : p.nombre),
    datasets: [{
      label: 'Unidades vendidas',
      data: productosMasVendidos.map(p => p.total_vendido || 0),
      backgroundColor: PINK_PALETTE,
      borderRadius: 8,
    }],
  };

  const catDonutChart = {
    labels: categorias.map(c => c.categoria),
    datasets: [{
      data: categorias.map(c => c.total_vendido || 0),
      backgroundColor: PINK_PALETTE,
      borderWidth: 0,
    }],
  };

  // Group clients by month for chart
  const clientesMes = clientesTop.reduce((acc, c) => {
    const key = `${c.año}-${String(c.mes).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = { label: `${c.mes}/${c.año}`, total: 0 };
    acc[key].total += parseFloat(c.total_compras || 0);
    return acc;
  }, {});
  const clientesMesArr = Object.values(clientesMes).slice(-6);

  const clientesChart = {
    labels: clientesMesArr.map(c => c.label),
    datasets: [{
      label: 'Compras totales (Bs)',
      data: clientesMesArr.map(c => c.total),
      backgroundColor: 'rgba(255,140,105,0.7)',
      borderColor: '#FF8C69',
      borderRadius: 8,
    }],
  };

  // Top 5 unique clients
  const uniqueClients = Object.values(
    clientesTop.reduce((acc, c) => {
      if (!acc[c.email]) acc[c.email] = { nombre: c.nombre, apellido: c.apellido, email: c.email, total: 0, pedidos: 0 };
      acc[c.email].total += parseFloat(c.total_compras || 0);
      acc[c.email].pedidos += parseInt(c.total_pedidos || 0);
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total).slice(0, 5);

  const chartOpts = { responsive: true, plugins: { legend: { position: 'top' } } };

  return (
    <AdminLayout title="Estadísticas" subtitle="Análisis detallado del rendimiento de la tienda">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <a href={reportesService.getVentasPDF()} target="_blank" rel="noreferrer" className="btn btn-primary">
          PDF Exportar Reporte PDF
        </a>
      </div>

      {/* Row 1: Line + Doughnut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={S.chartCard}>
          <h3 style={S.chartTitle}> Tendencia de Ingresos (12 meses)</h3>
          {ventasMes.length > 0
            ? <Line data={ventasLineChart} options={{ ...chartOpts, plugins: { legend: { position: 'top' } } }} />
            : <EmptyChart />}
        </div>
        <div style={S.chartCard}>
          <h3 style={S.chartTitle}>TAG️ Ventas por Categoría</h3>
          {categorias.length > 0
            ? <Doughnut data={catDonutChart} options={{ ...chartOpts, plugins: { legend: { position: 'bottom' } } }} />
            : <EmptyChart />}
        </div>
      </div>

      {/* Row 2: Bar (ventas + pedidos) */}
      <div style={S.chartCard}>
        <h3 style={S.chartTitle}> Ingresos y Pedidos por Mes</h3>
        {ventasMes.length > 0
          ? <Bar data={ventasBarChart} options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: {
                y: { type: 'linear', position: 'left', title: { display: true, text: 'Ingresos (Bs)' } },
                y1: { type: 'linear', position: 'right', title: { display: true, text: 'Pedidos' }, grid: { drawOnChartArea: false } },
              },
            }} />
          : <EmptyChart />}
      </div>

      {/* Row 3: Products + Clients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div style={S.chartCard}>
          <h3 style={S.chartTitle}> Top 10 Productos Más Vendidos</h3>
          {productosMasVendidos.length > 0
            ? <Bar data={prodBarChart} options={{ ...chartOpts, indexAxis: 'y', plugins: { legend: { display: false } } }} />
            : <EmptyChart />}
        </div>
        <div style={S.chartCard}>
          <h3 style={S.chartTitle}> Compras por Mes (Clientes)</h3>
          {clientesMesArr.length > 0
            ? <Bar data={clientesChart} options={{ ...chartOpts, plugins: { legend: { display: false } } }} />
            : <EmptyChart />}
        </div>
      </div>

      {/* Top clients table */}
      <div style={{ ...S.chartCard, marginTop: 24 }}>
        <h3 style={S.chartTitle}> Top 5 Clientes por Compras</h3>
        {uniqueClients.length === 0 ? <EmptyChart /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FFF0F3' }}>
                <th style={S.th}>#</th>
                <th style={S.th}>Cliente</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Pedidos</th>
                <th style={S.th}>Total Compras</th>
              </tr>
            </thead>
            <tbody>
              {uniqueClients.map((c, i) => (
                <tr key={c.email} style={{ borderBottom: '1px solid #F0E0E5' }}>
                  <td style={S.td}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? '#E8637A' : '#F0E0E5', color: i < 3 ? 'white' : '#5C3D47', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={S.td}><strong>{c.nombre} {c.apellido}</strong></td>
                  <td style={{ ...S.td, color: '#9B7B84' }}>{c.email}</td>
                  <td style={{ ...S.td, textAlign: 'center' }}>{c.pedidos}</td>
                  <td style={{ ...S.td, fontWeight: 800, color: '#E8637A', fontSize: 16 }}>Bs {c.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Products detail table */}
      <div style={{ ...S.chartCard, marginTop: 24 }}>
        <h3 style={S.chartTitle}> Detalle de Todos los Productos</h3>
        {productosMasVendidos.length === 0 ? <EmptyChart /> : (
          <div className="table-wrapper" style={{ boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Producto</th><th>Categoría</th><th>Vendidos</th><th>Ingresos</th><th>Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {productosMasVendidos.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.nombre}</strong></td>
                    <td><span className="badge badge-pink">{p.categoria}</span></td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{p.total_vendido || 0}</td>
                    <td style={{ fontWeight: 700, color: '#E8637A' }}>Bs {parseFloat(p.total_ingresos || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>{p.num_pedidos || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function EmptyChart() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9B7B84' }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}></div>
      <p>Aún no hay datos suficientes para mostrar esta gráfica.</p>
      <p style={{ fontSize: 13 }}>Los datos aparecerán una vez que haya ventas registradas.</p>
    </div>
  );
}

const S = {
  chartCard: { background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 15px rgba(232,99,122,0.08)', marginBottom: 0 },
  chartTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#1A1A1A', marginBottom: 20 },
  th: { padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#E8637A', textTransform: 'uppercase' },
  td: { padding: '12px 16px', fontSize: 14 },
};
