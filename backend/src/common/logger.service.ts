import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Request } from 'express';

@Injectable()
export class LoggerService {
  constructor(private readonly db: DatabaseService) {}

  async logAcceso({ usuario_id, email, ip, evento, browser, sistema_operativo, descripcion }: any) {
    try {
      await this.db.query(
        'INSERT INTO log_acceso (usuario_id, email, ip, evento, browser, sistema_operativo, descripcion) VALUES (?,?,?,?,?,?,?)',
        [usuario_id || null, email || null, ip, evento, browser || null, sistema_operativo || null, descripcion || null],
      );
    } catch (err) {
      console.error('Error al registrar log de acceso:', err.message);
    }
  }

  async logActividad({ usuario_id, email, rol, accion, modulo, detalle, ip }: any) {
    try {
      await this.db.query(
        'INSERT INTO log_actividad (usuario_id, email, rol, accion, modulo, detalle, ip) VALUES (?,?,?,?,?,?,?)',
        [usuario_id || null, email || null, rol || null, accion, modulo || null, detalle || null, ip || null],
      );
    } catch (err) {
      console.error('Error al registrar log de actividad:', err.message);
    }
  }

  getClientInfo(req: Request) {
    const UAParser = require('ua-parser-js');
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();
    return {
      browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
      sistema_operativo: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
      ip: req.ip || (req.connection as any).remoteAddress || req.headers['x-forwarded-for'] || 'unknown',
    };
  }
}
