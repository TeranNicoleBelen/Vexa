const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Confiar en proxies (DEBE estar antes de rate-limit)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting - CON trust proxy configurado
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: 'Demasiadas solicitudes, intenta más tarde.',
  trustProxy: true,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168')) {
      return callback(null, true);
    }
    if (origin.includes('railway.app')) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://vexa-frontend-production.up.railway.app'
    ].filter(Boolean);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS no permitido'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const routes = require('./routes/index');
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    app: 'VEXA Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'El archivo es demasiado grande (máx 5MB)' });
  }
  res.status(500).json({ success: false, message: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║         VEXA Backend API              ║
  ║    Tienda de Limpieza & Belleza       ║
  ╠═══════════════════════════════════════╣
  ║  Puerto: ${PORT}                          ║
  ║  Entorno: ${process.env.NODE_ENV}              ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = app;