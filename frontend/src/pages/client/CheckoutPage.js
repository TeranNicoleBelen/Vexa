import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { useCart } from '../../context/CartContext';
import { pedidosService } from '../../utils/api';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: entrega, 2: pago, 3: confirmación
  const [form, setForm] = useState({
    tipo_entrega: '', metodo_pago: '',
    direccion_envio: '', ciudad: '', zona: '', referencia: '', telefono_contacto: '', notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (items.length === 0) { navigate('/carrito'); return null; }

  const costoEnvio = form.tipo_entrega === 'envio' && total < 200 ? 15 : 0;
  const totalFinal = total + costoEnvio;

  const validate = () => {
    const err = {};
    if (!form.tipo_entrega) err.tipo_entrega = 'Selecciona el tipo de entrega';
    if (!form.metodo_pago) err.metodo_pago = 'Selecciona el método de pago';
    if (form.tipo_entrega === 'envio') {
      if (!form.direccion_envio.trim()) err.direccion_envio = 'La dirección es requerida';
      if (!form.ciudad.trim()) err.ciudad = 'La ciudad es requerida';
      if (!form.zona.trim()) err.zona = 'La zona es requerida';
      if (!form.telefono_contacto.trim()) err.telefono_contacto = 'El teléfono de contacto es requerido';
      if (!form.referencia.trim()) err.referencia = 'Una referencia es requerida para ubicarte';
    }
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return toast.error('Completa todos los campos requeridos'); }
    setLoading(true);
    try {
      const payload = {
        items: items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        ...form,
      };
      const res = await pedidosService.create(payload);
      clearCart();
      toast.success('¡Pedido confirmado!');
      navigate(`/pedido-confirmado/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar el pedido');
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <h1 style={S.title}>Finalizar Compra</h1>

        {/* Steps */}
        <div style={S.steps}>
          {['Entrega', 'Pago', 'Confirmar'].map((s, i) => (
            <div key={s} style={S.stepItem}>
              <div style={{ ...S.stepCircle, background: step > i ? '#E8637A' : step === i + 1 ? '#1A1A1A' : '#F0E0E5', color: step >= i + 1 ? 'white' : '#9B7B84' }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: step === i + 1 ? '#1A1A1A' : '#9B7B84', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#E8637A' : '#F0E0E5' }} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={S.layout}>
            <div style={{ flex: 1 }}>
              {/* STEP 1: Tipo entrega */}
              <div style={S.section}>
                <h2 style={S.sectionTitle}>1. Tipo de Entrega</h2>
                <div style={S.optionGrid}>
                  {[
                    { value: 'envio', icon: '🚚', title: 'Envío a Domicilio', desc: `Bs ${total >= 200 ? '0 (¡Gratis!)' : '15.00'}` },
                    { value: 'recogida', icon: '🏪', title: 'Recoger en Tienda', desc: 'Av. Principal 123, La Paz' },
                  ].map(opt => (
                    <div key={opt.value} onClick={() => { setForm(f => ({ ...f, tipo_entrega: opt.value })); setErrors(e => ({ ...e, tipo_entrega: '' })); }}
                      style={{ ...S.optCard, ...(form.tipo_entrega === opt.value ? S.optCardActive : {}) }}>
                      <div style={S.optIcon}>{opt.icon}</div>
                      <strong style={{ fontSize: 15 }}>{opt.title}</strong>
                      <span style={{ fontSize: 13, color: '#9B7B84' }}>{opt.desc}</span>
                    </div>
                  ))}
                </div>
                {errors.tipo_entrega && <p className="form-error">{errors.tipo_entrega}</p>}

                {form.tipo_entrega === 'envio' && (
                  <div style={S.addressForm}>
                    <h3 style={S.subTitle}>📍 Datos de Envío (campos obligatorios)</h3>
                    <div className="form-group">
                      <label className="form-label">Dirección Exacta *</label>
                      <input className={`form-control${errors.direccion_envio ? ' error' : ''}`} placeholder="Ej: Calle Murillo #456, piso 2" value={form.direccion_envio} onChange={e => setForm(f => ({ ...f, direccion_envio: e.target.value }))} />
                      {errors.direccion_envio && <p className="form-error">{errors.direccion_envio}</p>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Ciudad *</label>
                        <input className={`form-control${errors.ciudad ? ' error' : ''}`} placeholder="La Paz" value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} />
                        {errors.ciudad && <p className="form-error">{errors.ciudad}</p>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Zona / Barrio *</label>
                        <input className={`form-control${errors.zona ? ' error' : ''}`} placeholder="Sopocachi, Miraflores..." value={form.zona} onChange={e => setForm(f => ({ ...f, zona: e.target.value }))} />
                        {errors.zona && <p className="form-error">{errors.zona}</p>}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Referencia de Ubicación *</label>
                      <input className={`form-control${errors.referencia ? ' error' : ''}`} placeholder="Ej: Frente al parque, edificio de vidrio..." value={form.referencia} onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))} />
                      {errors.referencia && <p className="form-error">{errors.referencia}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono de Contacto *</label>
                      <input type="tel" className={`form-control${errors.telefono_contacto ? ' error' : ''}`} placeholder="+591 7XXXXXXX" value={form.telefono_contacto} onChange={e => setForm(f => ({ ...f, telefono_contacto: e.target.value }))} />
                      {errors.telefono_contacto && <p className="form-error">{errors.telefono_contacto}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notas adicionales</label>
                      <textarea className="form-control" placeholder="Instrucciones especiales para el delivery..." value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2} />
                    </div>
                  </div>
                )}

                {form.tipo_entrega === 'recogida' && (
                  <div style={S.storeInfo}>
                    <h3 style={S.subTitle}>📍 Ubicación de la Tienda</h3>
                    <div style={S.storeCard}>
                      <p style={{ fontWeight: 600, fontSize: 16 }}>VEXA - Tienda Central</p>
                      <p style={{ color: '#9B7B84', marginTop: 4 }}>Mercado Ciudad Satélite, El Alto, Bolivia</p>
                      <p style={{ color: '#9B7B84', fontSize: 13, marginTop: 4 }}>📞 +591 60612998 / 73503017 | ⏰ Lun–Sáb: 8:00 – 20:00</p>
                      <a href="https://maps.google.com/?q=La+Paz+Bolivia" target="_blank" rel="noreferrer"
                        style={{ display: 'inline-block', marginTop: 12, color: '#E8637A', fontSize: 14 }}>
                        🗺️ Ver en Google Maps
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Método de pago */}
              <div style={S.section}>
                <h2 style={S.sectionTitle}>2. Método de Pago</h2>
                <div style={S.optionGrid}>
                  {[
                    { value: 'qr', icon: '📱', title: 'Pago QR', desc: 'Escanea y paga al instante' },
                    { value: 'tarjeta', icon: '💳', title: 'Tarjeta', desc: 'Crédito o Débito' },
                    ...(form.tipo_entrega === 'recogida' ? [{ value: 'efectivo', icon: '💵', title: 'Efectivo en Tienda', desc: 'Paga al recoger' }] : []),
                  ].map(opt => (
                    <div key={opt.value} onClick={() => { setForm(f => ({ ...f, metodo_pago: opt.value })); setErrors(e => ({ ...e, metodo_pago: '' })); }}
                      style={{ ...S.optCard, ...(form.metodo_pago === opt.value ? S.optCardActive : {}) }}>
                      <div style={S.optIcon}>{opt.icon}</div>
                      <strong style={{ fontSize: 15 }}>{opt.title}</strong>
                      <span style={{ fontSize: 13, color: '#9B7B84' }}>{opt.desc}</span>
                    </div>
                  ))}
                </div>
                {errors.metodo_pago && <p className="form-error">{errors.metodo_pago}</p>}

                {form.metodo_pago === 'qr' && (
                  <div style={S.payInfo}>
                    <p style={{ fontWeight: 600 }}>📱 Escanea el código QR al finalizar el pedido</p>
                    <div style={S.qrMock}>
                      <div style={{ fontSize: 60 }}>📲</div>
                      <p style={{ fontSize: 13, color: '#9B7B84' }}>El QR estará disponible tras confirmar el pedido</p>
                    </div>
                  </div>
                )}
                {form.metodo_pago === 'tarjeta' && (
                  <div style={S.payInfo}>
                    <p style={{ fontWeight: 600, marginBottom: 16 }}>💳 Datos de la Tarjeta</p>
                    <div className="form-group">
                      <label className="form-label">Número de Tarjeta</label>
                      <input className="form-control" placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Vencimiento</label>
                        <input className="form-control" placeholder="MM/AA" maxLength={5} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input className="form-control" placeholder="123" maxLength={4} type="password" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nombre en la Tarjeta</label>
                      <input className="form-control" placeholder="NOMBRE APELLIDO" style={{ textTransform: 'uppercase' }} />
                    </div>
                  </div>
                )}
                {form.metodo_pago === 'efectivo' && (
                  <div style={{ ...S.payInfo, background: '#F0FDF4', borderColor: '#86EFAC' }}>
                    <p style={{ color: '#166534', fontWeight: 600 }}>💵 Pago en efectivo al recoger el pedido en tienda</p>
                    <p style={{ color: '#166534', fontSize: 14, marginTop: 8 }}>Presenta tu código de pedido al llegar.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div style={S.summary}>
              <h2 style={S.summaryTitle}>Tu Pedido</h2>
              {items.map(item => (
                <div key={item.id} style={S.summaryItem}>
                  <span style={{ flex: 1, fontSize: 13 }}>{item.nombre} x{item.cantidad}</span>
                  <strong style={{ fontSize: 13 }}>Bs {(parseFloat(item.precio) * item.cantidad).toFixed(2)}</strong>
                </div>
              ))}
              <div style={S.summaryDivider} />
              <div style={S.summaryRow}><span>Subtotal:</span><strong>Bs {total.toFixed(2)}</strong></div>
              <div style={S.summaryRow}>
                <span>Envío:</span>
                <strong style={{ color: costoEnvio === 0 ? '#27ae60' : '#E8637A' }}>{costoEnvio === 0 ? 'Gratis' : `Bs ${costoEnvio.toFixed(2)}`}</strong>
              </div>
              <div style={S.summaryDivider} />
              <div style={{ ...S.summaryRow, fontSize: 20, fontWeight: 800, color: '#E8637A' }}>
                <span>TOTAL:</span><strong>Bs {totalFinal.toFixed(2)}</strong>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 16, fontSize: 16, marginTop: 20 }} disabled={loading}>
                {loading ? '⏳ Procesando...' : '✅ Confirmar Pedido'}
              </button>
              <p style={{ fontSize: 12, color: '#9B7B84', textAlign: 'center', marginTop: 12 }}>
                Al confirmar aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

const S = {
  title: { fontFamily: "'Playfair Display', serif", fontSize: 36, marginBottom: 32 },
  steps: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 },
  stepItem: { display: 'flex', alignItems: 'center', gap: 8, flex: 1 },
  stepCircle: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 },
  layout: { display: 'flex', gap: 32, alignItems: 'flex-start' },
  section: { background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 15px rgba(232,99,122,0.08)', marginBottom: 24 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 20 },
  subTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16, marginTop: 20 },
  optionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 },
  optCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 16px', borderRadius: 12, border: '2px solid #F0E0E5', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' },
  optCardActive: { border: '2px solid #E8637A', background: '#FFF0F3' },
  optIcon: { fontSize: 36 },
  addressForm: { marginTop: 20, borderTop: '1px solid #F0E0E5', paddingTop: 20 },
  storeInfo: { marginTop: 20 },
  storeCard: { background: '#F9F0F3', borderRadius: 12, padding: 20, border: '1px solid #FFB6C1' },
  payInfo: { marginTop: 20, background: '#FFF0F3', borderRadius: 12, padding: 20, border: '1px solid #FFB6C1' },
  qrMock: { textAlign: 'center', padding: '20px 0' },
  summary: { width: 320, background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 15px rgba(232,99,122,0.08)', position: 'sticky', top: 90, flexShrink: 0 },
  summaryTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 16 },
  summaryItem: { display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  summaryDivider: { height: 1, background: '#F0E0E5', margin: '12px 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 15 },
};
