const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { registrarLog } = require('../utils/logger');

const getIp = (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip;

// Evaluar fortaleza de contraseña
const evaluarPassword = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return 'débil';
  if (score <= 4) return 'intermedia';
  return 'fuerte';
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });

    const [rows] = await pool.execute(
      'SELECT u.*, r.nombre as rol FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.email = ? AND u.eliminado = 0',
      [email.toLowerCase().trim()]
    );

    if (!rows.length) {
      await registrarLog({ email, ip: getIp(req), evento: 'ingreso', descripcion: 'Intento fallido - usuario no encontrado', browser_raw: req.headers['user-agent'] });
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const user = rows[0];
    if (!user.activo) return res.status(401).json({ success: false, message: 'Cuenta desactivada' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await registrarLog({ usuario_id: user.id, email, ip: getIp(req), evento: 'ingreso', descripcion: 'Intento fallido - contraseña incorrecta', browser_raw: req.headers['user-agent'] });
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    await registrarLog({ usuario_id: user.id, email, ip: getIp(req), evento: 'ingreso', descripcion: `Ingreso exitoso como ${user.rol}`, browser_raw: req.headers['user-agent'] });

    const { password: _, ...userSafe } = user;
    res.json({ success: true, token, user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// REGISTRO
exports.register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono } = req.body;
    if (!nombre || !apellido || !email || !password) return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: 'Email no válido' });

    const fortaleza = evaluarPassword(password);

    const [exists] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email.toLowerCase().trim()]);
    if (exists.length) return res.status(409).json({ success: false, message: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 12);
    const uid = uuidv4();

    await pool.execute(
      'INSERT INTO usuarios (uuid, nombre, apellido, email, password, telefono, rol_id) VALUES (?,?,?,?,?,?,3)',
      [uid, nombre.trim(), apellido.trim(), email.toLowerCase().trim(), hash, telefono || null]
    );

    await registrarLog({ email, ip: getIp(req), evento: 'registro', descripcion: `Nuevo registro de usuario. Fortaleza de contraseña: ${fortaleza}`, browser_raw: req.headers['user-agent'] });

    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', fortaleza });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    await registrarLog({ usuario_id: req.user.id, email: req.user.email, ip: getIp(req), evento: 'salida', descripcion: 'Cierre de sesión', browser_raw: req.headers['user-agent'] });
    res.json({ success: true, message: 'Sesión cerrada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// EVALUAR CONTRASEÑA
exports.checkPassword = (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false });
  res.json({ success: true, fortaleza: evaluarPassword(password) });
};

// PERFIL
exports.perfil = async (req, res) => {
  const { password: _, ...user } = req.user;
  res.json({ success: true, user });
};
