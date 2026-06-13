import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/shared/AdminLayout';
import { logsService } from '../../utils/api';

const eventoBadge = {
  ingreso: { bg: '#D4EDDA', color: '#155724', icon: '' },
  salida: { bg: '#D1ECF1', color: '#0C5460', icon: '' },
  registro: { bg: '#CCE5FF', color: '#004085', icon: '' },
  intento_fallido: { bg: '#F8D7DA', color: '#721C24', icon: 'BLOQ' },
  cambio_password: { bg: '#FFF3CD', color: '#856404', icon: '' },
};

export default function AdminLogs() {
  const [activeTab, setActiveTab] = useState('acceso');
  const [logsAcceso, setLogsAcceso] = useState([]);
  const [logsActividad, setLogsActividad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEvento, setFilterEvento] = useState('');
  const [filterModulo, setFilterModulo] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [acc, act] = await Promise.all([
        logsService.getAcceso({ limit: 200 }),
        logsService.getActividad({ limit: 200 }),
      ]);
      setLogsAcceso(acc.data.data || []);
      setLogsActividad(act.data.data || []);
    } catch {}
    setLoading(false);
  };

  const filteredAcceso = logsAcceso.filter(l =>
    (!filterEvento || l.evento === filterEvento) &&
    (!search || (l.email || '').toLowerCase().includes(search.toLowerCase()) || (l.ip || '').includes(search))
  );

  const filteredActividad = logsActividad.filter(l =>
    (!filterModulo || l.modulo === filterModulo) &&
    (!search || (l.email || '').toLowerCase().includes(search.toLowerCase()) || (l.accion || '').toLowerCase().includes(search.toLowerCase()))
  );

  const modulosUnicos = [...new Set(logsActividad.map(l => l.modulo).filter(Boolean))];

  return (
    <AdminLayout title="Historial del Sistema" subtitle="Registro completo de accesos y actividad de usuarios">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '', label: 'Total Eventos', value: logsAcceso.length, color: '#E8637A' },
          { icon: '', label: 'Ingresos', value: logsAcceso.filter(l => l.evento === 'ingreso').length, color: '#27ae60' },
          { icon: '', label: 'Salidas', value: logsAcceso.filter(l => l.evento === 'salida').length, color: '#3498db' },
          { icon: 'BLOQ', label: 'Intentos Fallidos', value: logsAcceso.filter(l => l.evento === 'intento_fallido').length, color: '#e74c3c' },
          { icon: '', label: 'Acciones', value: logsActividad.length, color: '#FF8C69' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 4px 15px rgba(232,99,122,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9B7B84', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'white', borderRadius: 12, padding: 6, boxShadow: '0 4px 15px rgba(232,99,122,0.08)', width: 'fit-content' }}>
        {[{ key: 'acceso', label: 'SEGURO Log de Acceso' }, { key: 'actividad', label: ' Log de Actividad' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '10px 24px', border: 'none', cursor: 'pointer', borderRadius: 8, fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: activeTab === tab.key ? 600 : 400, background: activeTab === tab.key ? '#E8637A' : 'none', color: activeTab === tab.key ? 'white' : '#9B7B84', transition: 'all 0.2s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="text" placeholder=" Buscar por email, IP, acción..." value={search} onChange={e => setSearch(e.target.value)} className="form-control" style={{ maxWidth: 300 }} />
        {activeTab === 'acceso' && (
          <select className="form-control" style={{ maxWidth: 200 }} value={filterEvento} onChange={e => setFilterEvento(e.target.value)}>
            <option value="">Todos los eventos</option>
            <option value="ingreso">Ingreso</option>
            <option value="salida">Salida</option>
            <option value="registro">Registro</option>
            <option value="intento_fallido">Intento Fallido</option>
            <option value="cambio_password">Cambio Password</option>
          </select>
        )}
        {activeTab === 'actividad' && (
          <select className="form-control" style={{ maxWidth: 200 }} value={filterModulo} onChange={e => setFilterModulo(e.target.value)}>
            <option value="">Todos los módulos</option>
            {modulosUnicos.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        )}
        <button className="btn btn-secondary btn-sm" onClick={loadAll}> Actualizar</button>
      </div>

      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        <>
          {activeTab === 'acceso' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Evento</th><th>Usuario / Email</th><th>IP</th><th>Navegador</th><th>Sistema</th><th>Descripción</th><th>Fecha y Hora</th></tr>
                </thead>
                <tbody>
                  {filteredAcceso.map(log => {
                    const b = eventoBadge[log.evento] || { bg: '#F0E0E5', color: '#5C3D47', icon: '' };
                    return (
                      <tr key={log.id}>
                        <td>
                          <span style={{ background: b.bg, color: b.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {b.icon} {log.evento}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{log.nombre ? `${log.nombre} ${log.apellido || ''}` : '-'}</div>
                          <div style={{ fontSize: 12, color: '#9B7B84' }}>{log.email || '-'}</div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#5C3D47' }}>{log.ip || '-'}</td>
                        <td style={{ fontSize: 12, color: '#9B7B84', maxWidth: 160 }}>{log.browser || '-'}</td>
                        <td style={{ fontSize: 12, color: '#9B7B84' }}>{log.sistema_operativo || '-'}</td>
                        <td style={{ fontSize: 12, color: '#5C3D47', maxWidth: 200 }}>{log.descripcion || '-'}</td>
                        <td style={{ fontSize: 12, color: '#9B7B84', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString('es-BO')}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAcceso.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9B7B84' }}>Sin registros</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'actividad' && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Usuario</th><th>Rol</th><th>Módulo</th><th>Acción</th><th>Detalle</th><th>IP</th><th>Fecha y Hora</th></tr>
                </thead>
                <tbody>
                  {filteredActividad.map(log => (
                    <tr key={log.id}>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{log.email || '-'}</div>
                      </td>
                      <td>
                        <span className={`badge ${log.rol === 'admin' ? 'badge-dark' : log.rol === 'vendedor' ? 'badge-coral' : 'badge-pink'}`}>
                          {log.rol || '-'}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: '#F0E0E5', color: '#5C3D47', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                          {log.modulo || '-'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 500 }}>{log.accion}</td>
                      <td style={{ fontSize: 12, color: '#9B7B84', maxWidth: 200 }}>{log.detalle || '-'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.ip || '-'}</td>
                      <td style={{ fontSize: 12, color: '#9B7B84', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString('es-BO')}
                      </td>
                    </tr>
                  ))}
                  {filteredActividad.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9B7B84' }}>Sin registros</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
