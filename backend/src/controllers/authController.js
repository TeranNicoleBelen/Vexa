const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const svgCaptcha = require('svg-captcha');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { logAcceso, logActividad, getClientInfo } = require('../utils/logger');

// Almacén temporal de captchas (en producción usar Redis)
const captchaStore = new Map();

// Limpiar captchas expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of captchaStore.entries()) {
    if (now - val.created > 5 * 60 * 1000) captchaStore.delete(key);
  }
}, 5 * 60 * 1000);

// GET /api/auth/captcha
const getCaptcha = (req, res) => {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 2,
    color: true,
    background: '#fff0f5',
    width: 160,
    height: 50,
    fontSize: 42
  });
  const id = uuidv4();
  captchaStore.set(id, { text: captcha.text.toLowerCase(), created: Date.now() });
  res.json({ success: true, captchaId: id, svg: captcha.data });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password, captchaId, captchaText } = req.body;
  const { browser, sistema_operativo, ip } = getClientInfo(req);

  // Verificar captcha
  const stored = captchaStore.get(captchaId);
  if (!stored || stored.text !== (captchaText || '').toLowerCase()) {
    await logAcceso({ email, ip, evento: 'intento_fallido', browser, sistema_operativo, descripcion: 'CAPTCHA inválido' });
    return res.status(400).json({ success: false, message: 'CAPTCHA inválido o expirado' });
  }
  captchaStore.delete(captchaId);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.email = ? AND u.eliminado = 0',
      [email]
    );

    if (rows.length === 0) {
      await logAcceso({ email, ip, evento: 'intento_fallido', browser, sistema_operativo, descripcion: 'Email no encontrado' });
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const user = rows[0];
    if (!user.activo) {
      return res.status(401).json({ success: false, message: 'Cuenta desactivada. Contacta al administrador.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await logAcceso({ usuario_id: user.id, email, ip, evento: 'intento_fallido', browser, sistema_operativo, descripcion: 'Contraseña incorrecta' });
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol_nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await logAcceso({ usuario_id: user.id, email, ip, evento: 'ingreso', browser, sistema_operativo, descripcion: 'Login exitoso' });
    await logActividad({ usuario_id: user.id, email, rol: user.rol_nombre, accion: 'Inicio de sesión', modulo: 'Auth', ip });

    const { password: _, ...userSafe } = user;
    res.json({ success: true, token, user: userSafe });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  const { nombre, apellido, email, password, telefono } = req.body;
  const { browser, sistema_operativo, ip } = getClientInfo(req);

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Email inválido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol_id) VALUES (?,?,?,?,?,3)',
      [nombre, apellido, email, hashed, telefono || null]
    );

    await logAcceso({ usuario_id: result.insertId, email, ip, evento: 'registro', browser, sistema_operativo, descripcion: 'Registro de nuevo usuario' });
    await logActividad({ usuario_id: result.insertId, email, rol: 'cliente', accion: 'Registro de usuario', modulo: 'Auth', ip });

    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  const { browser, sistema_operativo, ip } = getClientInfo(req);
  if (req.user) {
    await logAcceso({
      usuario_id: req.user.id, email: req.user.email, ip,
      evento: 'salida', browser, sistema_operativo, descripcion: 'Cierre de sesión'
    });
    await logActividad({ usuario_id: req.user.id, email: req.user.email, rol: req.user.rol_nombre, accion: 'Cierre de sesión', modulo: 'Auth', ip });
  }
  res.json({ success: true, message: 'Sesión cerrada' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const { password: _, ...userSafe } = req.user;
  res.json({ success: true, user: userSafe });
};

// Evaluar fortaleza de contraseña
const checkPassword = (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false });

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let strength = 'débil';
  let color = '#FF4444';
  if (score >= 4) { strength = 'fuerte'; color = '#00C851'; }
  else if (score >= 2) { strength = 'intermedio'; color = '#FF8800'; }

  res.json({ success: true, strength, score, color });
};

module.exports = { getCaptcha, login, register, logout, getMe, checkPassword };
