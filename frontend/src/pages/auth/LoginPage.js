import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', captchaText: '' });
  const [captcha, setCaptcha] = useState({ id: '', svg: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadCaptcha(); }, []);

  const loadCaptcha = async () => {
    try {
      const res = await authService.getCaptcha();
      setCaptcha({ id: res.data.captchaId, svg: res.data.svg });
      setForm(f => ({ ...f, captchaText: '' }));
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Completa todos los campos');
    if (!form.captchaText) return toast.error('Ingresa el código CAPTCHA');
    setLoading(true);
    try {
      const res = await authService.login({ ...form, captchaId: captcha.id });
      login(res.data.token, res.data.user);
      toast.success(`¡Bienvenid@ ${res.data.user.nombre}!`);
      const rol = res.data.user.rol_nombre;
      if (rol === 'admin') navigate('/admin');
      else if (rol === 'vendedor') navigate('/vendedor');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al iniciar sesión');
      loadCaptcha();
    }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      <div style={S.left} className="auth-left-panel">
        <div style={S.brand}>
          <h1 style={S.logo}>VEXA</h1>
          <p style={S.tagline}>Limpieza & Belleza</p>
          <p style={S.desc}>Tu tienda de confianza para productos de limpieza y belleza en Bolivia.</p>
          <div style={S.features}>
            {['Productos de calidad', 'Envío a domicilio', 'Pago seguro', 'Ofertas exclusivas'].map(f => (
              <div key={f} style={S.feature}>{f}</div>
            ))}
          </div>
        </div>
        <div style={S.circles}>
          <div style={{ ...S.circle, width: 300, height: 300, top: -60, right: -60, background: 'rgba(255,182,193,0.15)' }} />
          <div style={{ ...S.circle, width: 200, height: 200, bottom: 60, left: -40, background: 'rgba(255,140,105,0.12)' }} />
        </div>
      </div>

      <div style={S.right} className="auth-right-panel">
        <div style={S.card}>
          <div style={S.cardHeader}>
            <Link to="/" style={S.backLink}>← Volver al inicio</Link>
            <h2 style={S.cardTitle}>Iniciar Sesión</h2>
            <p style={S.cardSub}>Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} style={S.form}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="form-group">
              <label className="form-label">Verificación CAPTCHA</label>
              <div style={S.captchaBox}>
                <div
                  dangerouslySetInnerHTML={{ __html: captcha.svg }}
                  style={{ borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}
                />
                <button type="button" onClick={loadCaptcha} title="Recargar captcha"
                  style={S.reloadBtn}></button>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Escribe los caracteres del CAPTCHA"
                value={form.captchaText}
                onChange={e => setForm({ ...form, captchaText: e.target.value })}
                style={{ marginTop: 8 }}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8 }} disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={S.footer}>
            <p style={{ fontSize: 14, color: '#9B7B84' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/registro" style={{ color: '#E8637A', fontWeight: 600 }}>Regístrate aquí</Link>
            </p>
              <div style={S.footer}>
              <p style={{ fontSize: 14, color: '#9B7B84' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/registro" style={{ color: '#E8637A', fontWeight: 600 }}>Regístrate aquí</Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" },
  left: {
    flex: 1, background: 'linear-gradient(135deg, #1A1A1A 0%, #3D1A24 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 60, position: 'relative', overflow: 'hidden',
    '@media (max-width: 768px)': { display: 'none' },
  },
  brand: { position: 'relative', zIndex: 2, color: 'white', maxWidth: 400 },
  logo: { fontFamily: "'Playfair Display', serif", fontSize: 56, color: '#FFB6C1', letterSpacing: 8, marginBottom: 4 },
  tagline: { fontSize: 14, color: '#FF8C69', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 24 },
  desc: { fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 32 },
  features: { display: 'flex', flexDirection: 'column', gap: 12 },
  feature: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  circles: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  circle: { position: 'absolute', borderRadius: '50%' },
  right: {
    width: 480, background: '#FDF5F7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 40,
    '@media (max-width: 768px)': { width: '100%' },
  },
  card: { width: '100%', maxWidth: 400 },
  cardHeader: { marginBottom: 32 },
  backLink: { color: '#9B7B84', textDecoration: 'none', fontSize: 13, display: 'block', marginBottom: 20 },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#1A1A1A', marginBottom: 8 },
  cardSub: { fontSize: 14, color: '#9B7B84' },
  form: {},
  captchaBox: { display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: 12, borderRadius: 8, border: '2px solid #F0E0E5' },
  reloadBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4 },
  footer: { marginTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 },
  testAccounts: { background: '#F0E0E5', borderRadius: 8, padding: 12, textAlign: 'left' },
  code: { display: 'block', fontFamily: 'monospace', fontSize: 12, color: '#5C3D47', marginBottom: 2, background: 'white', padding: '2px 6px', borderRadius: 4 },
};
