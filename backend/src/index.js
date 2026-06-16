const express = require('express');
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Demasiadas solicitudes, intenta más tarde.' }
});
app.use('/api/', limiter);

app.use(cors({
  origin: [process.env.CORS_ORIGIN || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const routes = require('./routes/index');
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'VEXA Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'El archivo es demasiado grande (máx 5MB)' });
  }
  res.status(500).json({ success: false, message: err.message || 'Error interno del servidor' });
});

async function start() {
  // Inicializar la base de datos (crea tablas si no existen) antes de levantar el servidor
  try {
    const { initDb } = require('../scripts/init-db');
    await initDb();
  } catch (err) {
    console.error('⚠️  No se pudo inicializar la BD, el servidor continuará igual:', err.message);
  }

  const server = app.listen(PORT, () => {
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

  const pool = require('./config/database');

  function shutdown(signal) {
    console.log(`\n${signal} recibido. Cerrando servidor...`);
    server.close(async () => {
      try {
        await pool.end();
        console.log('✅ Conexiones MySQL cerradas');
      } catch (err) {
        console.error('❌ Error cerrando pool MySQL:', err.message);
      }
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();

module.exports = app;
