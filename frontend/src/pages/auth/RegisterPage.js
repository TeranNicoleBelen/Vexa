import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../utils/api';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', confirm: '', telefono: '' });
  const [strength, setStrength] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const checkStrength = async (pwd) => {
    if (!pwd) return setStrength(null);
    try {
      const res = await authService.checkPassword(pwd);
      setStrength(res.data);
    } catch {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'password') checkStrength(value);
  };

  const validate = () => {
    if (!form.nombre.trim()) return 'El nombre es requerido';
    if (!form.apellido.trim()) return 'El apellido es requerido';
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email)) return 'Email inválido';
    if (form.password.length < 6) return 'La contraseña debe tener mínimo 6 caracteres';
    if (form.password !== form.confirm) return 'Las contraseñas no coinciden';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);
    setLoading(true);
    try {
      await authService.register({ nombre: form.nombre, apellido: form.apellido, email: form.email, password: form.password, telefono: form.telefono });
      toast.success('¡Cuenta creada! Ya puedes iniciar sesión.');
      navigate('/login');
    } catch (er) {
      toast.error(er.response?.data?.message || 'Error al registrarse');
    }
    setLoading(false);
  };

  const strengthLabel = { débil: 'Débil', intermedio: 'Intermedio', fuerte: 'Fuerte' };
  const strengthWidth = { débil: '33%', intermedio: '66%', fuerte: '100%' };
  const strengthColor = { débil: '#e74c3c', intermedio: '#f39c12', fuerte: '#27ae60' };

  return (
    <div style={S.page}>
      <div style={S.left} className="auth-left-panel">
        <div style={S.brand}>
          <h1 style={S.logo}>VEXA</h1>
          <p style={S.tagline}>Únete a nuestra familia</p>
          <p style={S.desc}>Regístrate y disfruta de los mejores productos de limpieza y belleza con envíos a domicilio, promociones exclusivas y más.</p>
          <div style={S.perks}>
            {['Acceso a toda la tienda', 'Historial de pedidos', 'Ofertas exclusivas', 'Programa de puntos'].map(p => (
              <div key={p} style={S.perk}>{p}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.right} className="auth-right-panel">
        <div style={S.card}>
          <Link to="/login" style={S.backLink}>← Volver al login</Link>
          <h2 style={S.title}>Crear Cuenta</h2>
          <p style={S.sub}>Completa el formulario para registrarte</p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="form-label">Nombre *</label>
                <input name="nombre" className="form-control" placeholder="María" value={form.nombre} onChange={handleChange} required />
              </div>
              <div>
                <label className="form-label">Apellido *</label>
                <input name="apellido" className="form-control" placeholder="García" value={form.apellido} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico *</label>
              <input name="email" type="email" className="form-control" placeholder="correo@ejemplo.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input name="telefono" type="tel" className="form-control" placeholder="+591 7XXXXXXX" value={form.telefono} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password" type={showPass ? 'text' : 'password'}
                  className="form-control" placeholder="Mínimo 6 caracteres"
                  value={form.password} onChange={handleChange} required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              {form.password && strength && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ background: '#F0E0E5', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strengthWidth[strength.strength], background: strengthColor[strength.strength], borderRadius: 4, transition: 'all 0.4s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: strengthColor[strength.strength], fontWeight: 600 }}>
                      Contraseña: {strengthLabel[strength.strength]}
                    </span>
                    <span style={{ fontSize: 11, color: '#9B7B84' }}>
                      {strength.strength === 'débil' && 'Agrega números y mayúsculas'}
                      {strength.strength === 'intermedio' && 'Agrega caracteres especiales'}
                      {strength.strength === 'fuerte' && '¡Excelente contraseña!'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {[
                      { ok: form.password.length >= 8, label: '8+ chars' },
                      { ok: /[A-Z]/.test(form.password), label: 'Mayúscula' },
                      { ok: /[0-9]/.test(form.password), label: 'Número' },
                      { ok: /[^A-Za-z0-9]/.test(form.password), label: 'Especial' },
                    ].map(r => (
                      <span key={r.label} style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: 11,
                        background: r.ok ? '#D4EDDA' : '#F8D7DA',
                        color: r.ok ? '#155724' : '#721C24',
                      }}>{r.ok ? '✓' : '✗'} {r.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Contraseña *</label>
              <input
                name="confirm" type="password" className="form-control"
                placeholder="Repite tu contraseña" value={form.confirm} onChange={handleChange} required
                style={{ borderColor: form.confirm && form.password !== form.confirm ? '#e74c3c' : undefined }}
              />
              {form.confirm && form.password !== form.confirm && (
                <p className="form-error">Las contraseñas no coinciden</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8 }} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#9B7B84' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#E8637A', fontWeight: 600 }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" },
  left: {
    flex: 1, background: 'linear-gradient(135deg, #3D1A24 0%, #1A1A1A 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60,
  },
  brand: { color: 'white', maxWidth: 400 },
  logo: { fontFamily: "'Playfair Display', serif", fontSize: 52, color: '#FFB6C1', letterSpacing: 8, marginBottom: 4 },
  tagline: { fontSize: 16, color: '#FF8C69', letterSpacing: 2, marginBottom: 20 },
  desc: { fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 32 },
  perks: { display: 'flex', flexDirection: 'column', gap: 12 },
  perk: { fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  right: { width: 520, background: '#FDF5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', overflowY: 'auto' },
  card: { width: '100%', maxWidth: 420 },
  backLink: { color: '#9B7B84', textDecoration: 'none', fontSize: 13, display: 'block', marginBottom: 20 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 30, color: '#1A1A1A', marginBottom: 6 },
  sub: { fontSize: 14, color: '#9B7B84', marginBottom: 28 },
};
