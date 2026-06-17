import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  async getAll(query: any) {
    const { rol_id, activo, search } = query;
    let q = 'SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.activo, u.eliminado, u.created_at, u.avatar, r.nombre as rol_nombre, u.rol_id FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.eliminado = 0';
    const params: any[] = [];
    if (rol_id) { q += ' AND u.rol_id = ?'; params.push(rol_id); }
    if (activo !== undefined) { q += ' AND u.activo = ?'; params.push(activo); }
    if (search) {
      q += ' AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    q += ' ORDER BY u.created_at DESC';
    const [rows] = await this.db.query(q, params);
    return { success: true, data: rows };
  }

  async getById(id: string) {
    const [rows] = await this.db.query(
      'SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.activo, u.avatar, r.nombre as rol_nombre, u.rol_id, u.created_at FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ? AND u.eliminado = 0',
      [id],
    );
    if (rows.length === 0) throw new NotFoundException('Usuario no encontrado');
    return { success: true, data: rows[0] };
  }

  async create(body: any, user: any, req: any) {
    const { nombre, apellido, email, password, telefono, rol_id } = body;
    const { ip } = this.logger.getClientInfo(req);

    if (!nombre || !apellido || !email || !password) {
      throw new BadRequestException('Todos los campos requeridos');
    }

    const [exists] = await this.db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exists.length > 0) throw new ConflictException('Email ya registrado');

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await this.db.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol_id) VALUES (?,?,?,?,?,?)',
      [nombre, apellido, email, hashed, telefono || null, rol_id || 3],
    );
    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Creó usuario: ${email}`, modulo: 'Usuarios', ip });
    return { success: true, message: 'Usuario creado', id: result.insertId };
  }

  async update(id: string, body: any, user: any, req: any) {
    const { nombre, apellido, telefono, rol_id, activo, password } = body;
    const { ip } = this.logger.getClientInfo(req);

    const [existing] = await this.db.query('SELECT * FROM usuarios WHERE id = ? AND eliminado = 0', [id]);
    if (existing.length === 0) throw new NotFoundException('Usuario no encontrado');

    let hashed = existing[0].password;
    if (password) hashed = await bcrypt.hash(password, 10);

    await this.db.query(
      'UPDATE usuarios SET nombre=?, apellido=?, telefono=?, rol_id=?, activo=?, password=? WHERE id=?',
      [nombre || existing[0].nombre, apellido || existing[0].apellido, telefono ?? existing[0].telefono,
       rol_id || existing[0].rol_id, activo !== undefined ? activo : existing[0].activo, hashed, id],
    );
    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Actualizó usuario ID: ${id}`, modulo: 'Usuarios', ip });
    return { success: true, message: 'Usuario actualizado' };
  }

  async remove(id: string, user: any, req: any) {
    const { ip } = this.logger.getClientInfo(req);
    if (parseInt(id) === user.id) {
      throw new BadRequestException('No puedes eliminarte a ti mismo');
    }
    const [existing] = await this.db.query('SELECT email FROM usuarios WHERE id = ? AND eliminado = 0', [id]);
    if (existing.length === 0) throw new NotFoundException('Usuario no encontrado');
    await this.db.query('UPDATE usuarios SET eliminado = 1, eliminado_at = NOW(), activo = 0 WHERE id = ?', [id]);
    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Eliminó usuario: ${existing[0].email}`, modulo: 'Usuarios', ip });
    return { success: true, message: 'Usuario eliminado' };
  }
}
