/**
 * VEXA - Script para resetear contraseñas
 * 
 * INSTRUCCIONES:
 * 1. Abre una terminal en la carpeta VEXA/backend
 * 2. Asegúrate de haber ejecutado: npm install
 * 3. Vuelve a la carpeta VEXA (cd ..)
 * 4. Ejecuta: node database/reset_passwords.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function resetPasswords() {
  let bcrypt, mysql;
  try {
    bcrypt = require(path.join(__dirname, '../backend/node_modules/bcrypt'));
    mysql = require(path.join(__dirname, '../backend/node_modules/mysql2/promise'));
  } catch (e) {
    console.error('❌ Error: Primero ejecuta "npm install" dentro de la carpeta backend');
    console.error('   cd backend && npm install && cd ..');
    process.exit(1);
  }

  const password = 'Admin@123';
  const hash = await bcrypt.hash(password, 10);
  console.log('\n✅ Hash generado correctamente');

  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vexa_db',
    });

    const emails = ['admin@vexa.com', 'vendedor@vexa.com', 'cliente@vexa.com'];
    for (const email of emails) {
      const [result] = await conn.query(
        'UPDATE usuarios SET password = ? WHERE email = ?',
        [hash, email]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ Password actualizado: ${email}`);
      } else {
        console.log(`⚠️  Usuario no encontrado: ${email} (puede que no exista en la BD)`);
      }
    }

    console.log('\n🎉 Listo! Credenciales de acceso:');
    console.log('   Admin:    admin@vexa.com    → Admin@123');
    console.log('   Vendedor: vendedor@vexa.com → Admin@123');
    console.log('   Cliente:  cliente@vexa.com  → Admin@123\n');
  } catch (err) {
    console.error('\n❌ Error de conexión a la base de datos:');
    console.error('   ', err.message);
    console.error('\n   Verifica que:');
    console.error('   1. XAMPP esté corriendo (MySQL activo)');
    console.error('   2. La base de datos vexa_db exista en phpMyAdmin');
    console.error('   3. El archivo backend/.env tenga los datos correctos\n');
  } finally {
    if (conn) conn.end();
  }
}

resetPasswords();
