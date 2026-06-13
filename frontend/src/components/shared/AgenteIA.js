import React, { useState, useRef, useEffect } from 'react';

const VEXA_KNOWLEDGE = `
Eres LUNA, la asistente virtual inteligente de VEXA, una tienda boliviana de artículos de limpieza y belleza ubicada en El Alto.
Hablas siempre en español, con un tono amable, femenino y profesional.
Usas emojis moderadamente para ser más cercana.

SOBRE VEXA:
- Tienda ubicada en el Mercado Ciudad Satélite, El Alto, Bolivia
- Especializados en productos de limpieza del hogar y cuidado personal/belleza
- Dirección: Mercado Ciudad Satélite, El Alto, Bolivia
- Teléfono 1: +591 60612998
- Teléfono 2: +591 73503017
- Email: terannicole06@gmail.com
- Horario: Lunes a Sábado 8:00 – 20:00

CATEGORÍAS DE PRODUCTOS:
1. Limpieza del Hogar - Detergentes, cloros, limpiavidrios, desinfectantes
2. Cuidado Personal - Jabones, geles antibacteriales, higiene íntima
3. Belleza - Cosméticos, bases, labiales, sombras
4. Cabello - Shampoos, acondicionadores, tratamientos, tintes
5. Skin Care - Cremas hidratantes, sérum, protectores solares
6. Fragancias - Perfumes, desodorantes, splash

POLÍTICAS:
- Envío gratis en pedidos mayores a 200 Bs
- Envío normal: 15 Bs (dentro de El Alto y La Paz)
- Formas de pago: QR, tarjeta de crédito/débito, efectivo en tienda
- Recogida gratuita en tienda (Mercado Ciudad Satélite)

PUEDES AYUDAR CON:
- Información sobre productos y categorías
- Proceso de compra y pagos
- Política de envíos
- Cómo crear una cuenta
- Navegar por la tienda
- Recomendaciones de productos
- Información sobre la empresa

Si no sabes algo específico, sugiere contactar al equipo: +591 60612998 o terannicole06@gmail.com
Responde siempre en español, sé concisa (máximo 3-4 oraciones por respuesta).
`;

const QUICK_QUESTIONS = [
  '¿Cómo hago un pedido?',
  '¿Cuánto cuesta el envío?',
  '¿Qué métodos de pago aceptan?',
  '¿Dónde están ubicados?',
  '¿Tienen envío gratis?',
  '¿Qué productos venden?',
];


function LunaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="8" r="5" fill="rgba(255,182,193,0.9)"/>
      <path d="M4 20 Q4 14 11 14 Q18 14 18 20" fill="rgba(255,182,193,0.7)"/>
      <circle cx="9" cy="7" r="1" fill="rgba(255,255,255,0.6)"/>
      <circle cx="13" cy="7" r="1" fill="rgba(255,255,255,0.6)"/>
      <path d="M9 10 Q11 12 13 10" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export default function AgenteIA() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! 💕 Soy Luna, tu asistente de VEXA. ¿En qué puedo ayudarte hoy? Puedo orientarte con productos, pedidos, envíos y más.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system: VEXA_KNOWLEDGE,
          messages: newMessages.slice(1).map(m => ({ role: m.role, content: m.text }))
        })
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Lo siento, no pude procesar tu pregunta. Contáctanos al +591 60612998 💕';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Disculpa, tuve un problema. Escríbenos a terannicole06@gmail.com o llama al +591 60612998 💕' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 500,
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, #E8637A, #FF8C69)',
          border: 'none', cursor: 'pointer', fontSize: 26,
          boxShadow: '0 4px 20px rgba(232,99,122,0.4)',
          transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: open ? 'none' : 'pulse 2s ease-in-out infinite',
        }}
        title="Agente LUNA - VEXA"
      >
        {open ? '✕' : <LunaIcon />}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 24, zIndex: 500,
          width: 340, maxHeight: 520,
          background: 'white', borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ background: 'linear-gradient(135deg, #E8637A, #FF8C69)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LunaIcon /></div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15, fontFamily: "'Poppins', sans-serif" }}>Luna — VEXA</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Asistente virtual • En línea ✓</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #E8637A, #FF8C69)' : '#F9F0F3',
                  color: msg.role === 'user' ? 'white' : '#1A1A1A',
                  fontSize: 13, lineHeight: 1.5, fontFamily: "'Poppins', sans-serif",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '12px 16px', background: '#F9F0F3', borderRadius: '18px 18px 18px 4px', fontSize: 16 }}>⋯</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div style={{ padding: '0 16px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_QUESTIONS.slice(0, 3).map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{
                  padding: '5px 10px', borderRadius: 20, border: '1px solid #FFB6C1',
                  background: 'white', color: '#E8637A', fontSize: 11, cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}>{q}</button>
              ))}
            </div>
          )}

          <div style={{ padding: '12px 16px', borderTop: '1px solid #F0E0E5', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu pregunta..."
              style={{ flex: 1, padding: '10px 14px', border: '2px solid #FFB6C1', borderRadius: 20, outline: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif" }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E8637A, #FF8C69)',
                border: 'none', cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: (loading || !input.trim()) ? 0.5 : 1,
              }}
            >➤</button>
          </div>
        </div>
      )}
    </>
  );
}
