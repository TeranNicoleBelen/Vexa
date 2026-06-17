const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MAX_RETRIES = 20;
const RETRY_DELAY_MS = 3000;

function getDbConfig() {
  return {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    multipleStatements: true
  };
}

function getTargetDb() {
  return process.env.MYSQLDATABASE || process.env.DB_NAME || 'vexa_db';
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectWithRetry() {
  const dbConfig = getDbConfig();

  console.log('DEBUG DB CONFIG (init-db):', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: getTargetDb()
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      console.log(`✅ Conectado a MySQL (intento ${attempt})`);
      return connection;
    } catch (err) {
      console.log(`⏳ Intento ${attempt}/${MAX_RETRIES} - MySQL no disponible aún: ${err.message}`);
      if (attempt === MAX_RETRIES) {
        throw new Error('❌ No se pudo conectar a MySQL después de varios intentos');
      }
      await wait(RETRY_DELAY_MS);
    }
  }
}

function findSqlFile() {
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'database', 'vexa_db.sql'),
    path.join(__dirname, '..', 'database', 'vexa_db.sql'),
    path.join(__dirname, '..', '..', '..', 'database', 'vexa_db.sql')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log(`✅ Archivo SQL encontrado: ${p}`);
      return p;
    } else {
      console.log(`❌ No encontrado: ${p}`);
    }
  }

  throw new Error('❌ No se encontró vexa_db.sql en ninguna ruta esperada');
}

function sanitizeSql(sql, targetDb) {
  let cleaned = sql;

  cleaned = cleaned.replace(/CREATE\s+DATABASE.*?;/gis, '');
  cleaned = cleaned.replace(/USE\s+`?[\w-]+`?\s*;/gis, '');

  cleaned = cleaned.replace(/DEFINER\s*=\s*`[^`]+`@`[^`]+`/gi, '');
  cleaned = cleaned.replace(/DEFINER\s*=\s*\S+\s+/gi, '');

  cleaned = cleaned.replace(/CREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS)/gi, 'CREATE TABLE IF NOT EXISTS ');
  cleaned = cleaned.replace(/INSERT\s+INTO\s+/gi, 'INSERT IGNORE INTO ');

  cleaned = `USE \`${targetDb}\`;\n${cleaned}`;

  return cleaned;
}

async function initDb() {
  console.log('🚀 Iniciando inicialización de base de datos...');

  const connection = await connectWithRetry();
  const TARGET_DB = getTargetDb();

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${TARGET_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Base de datos "${TARGET_DB}" verificada`);

    const sqlPath = findSqlFile();
    const rawSql = fs.readFileSync(sqlPath, 'utf8');
    const cleanedSql = sanitizeSql(rawSql, TARGET_DB);

    console.log('⚙️  Ejecutando script SQL...');
    await connection.query(cleanedSql);
    console.log('✅ Script SQL ejecutado correctamente');

    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [TARGET_DB]
    );

    console.log(`\n📊 Tablas en "${TARGET_DB}": ${tables.length}`);
    tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
  } catch (err) {
    console.error('❌ Error durante la inicialización:', err.message);
    throw err;
  } finally {
    await connection.end();
  }

  console.log('🎉 Inicialización completada con éxito');
}

module.exports = { initDb };

if (require.main === module) {
  initDb().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
