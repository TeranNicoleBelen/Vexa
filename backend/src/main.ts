import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
require('dotenv').config();

async function bootstrap() {
  // Inicializar BD antes de levantar el servidor
  try {
    const { initDb } = require('../scripts/init-db');
    await initDb();
  } catch (err) {
    console.error('⚠️  No se pudo inicializar la BD, el servidor continuará igual:', err.message);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  app.enableCors({
    origin: [process.env.CORS_ORIGIN || 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Static uploads
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  // Global prefix
  app.setGlobalPrefix('api');

  // Manejo de errores global (404, multer, etc.)
  const { HttpAdapterHost } = require('@nestjs/core');
  const { AllExceptionsFilter } = require('./common/all-exceptions.filter');
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);

  console.log(`
  ╔═══════════════════════════════════════╗
  ║         VEXA Backend API              ║
  ║    Tienda de Limpieza & Belleza       ║
  ╠═══════════════════════════════════════╣
  ║  Puerto: ${PORT}                          ║
  ║  Entorno: ${process.env.NODE_ENV || 'development'}              ║
  ╚═══════════════════════════════════════╝
  `);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('\nSIGTERM recibido. Cerrando servidor...');
    await app.close();
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    console.log('\nSIGINT recibido. Cerrando servidor...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();
