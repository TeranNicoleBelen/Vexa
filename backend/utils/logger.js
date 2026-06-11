const pool = require('../config/db');
const useragent = require('useragent');

const registrarLog = async ({ usuario_id = null, email = null, ip, evento, descripcion, browser_raw }) => {
  try {
    const agent = useragent.parse(browser_raw);
    const browser = `${agent.family} ${agent.major}`;
    const so = `${agent.os.family} ${agent.os.major}`;
    await pool.execute(
      'INSERT INTO logs_acceso (usuario_id, email, ip, evento, descripcion, browser, sistema_operativo) VALUES (?,?,?,?,?,?,?)',
      [usuario_id, email, ip, evento, descripcion, browser, so]
    );
  } catch (e) {
    console.error('Error registrando log:', e.message);
  }
};

module.exports = { registrarLog };
