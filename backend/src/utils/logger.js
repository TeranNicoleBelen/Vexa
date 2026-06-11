const pool = require('../config/database');

const logAcceso = async ({ usuario_id, email, ip, evento, browser, sistema_operativo, descripcion }) => {
  try {
    await pool.query(
      'INSERT INTO log_acceso (usuario_id, email, ip, evento, browser, sistema_operativo, descripcion) VALUES (?,?,?,?,?,?,?)',
      [usuario_id || null, email || null, ip, evento, browser || null, sistema_operativo || null, descripcion || null]
    );
  } catch (err) {
    console.error('Error al registrar log de acceso:', err.message);
  }
};

const logActividad = async ({ usuario_id, email, rol, accion, modulo, detalle, ip }) => {
  try {
    await pool.query(
      'INSERT INTO log_actividad (usuario_id, email, rol, accion, modulo, detalle, ip) VALUES (?,?,?,?,?,?,?)',
      [usuario_id || null, email || null, rol || null, accion, modulo || null, detalle || null, ip || null]
    );
  } catch (err) {
    console.error('Error al registrar log de actividad:', err.message);
  }
};

const getClientInfo = (req) => {
  const UAParser = require('ua-parser-js');
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    sistema_operativo: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown'
  };
};

module.exports = { logAcceso, logActividad, getClientInfo };
