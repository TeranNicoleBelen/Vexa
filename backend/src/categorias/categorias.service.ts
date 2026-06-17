import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class CategoriasService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  async getAll(query: any) {
    const { activo } = query;
    let q = 'SELECT c.*, COUNT(p.id) as total_productos FROM categorias c LEFT JOIN productos p ON c.id = p.categoria_id AND p.eliminado = 0 WHERE c.eliminado = 0';
    const params: any[] = [];
    if (activo !== undefined) { q += ' AND c.activo = ?'; params.push(activo); }
    q += ' GROUP BY c.id ORDER BY c.nombre';
    const [rows] = await this.db.query(q, params);
    return { success: true, data: rows };
  }

  async getById(id: string) {
    const [rows] = await this.db.query('SELECT * FROM categorias WHERE id = ? AND eliminado = 0', [id]);
    if (rows.length === 0) throw new NotFoundException('Categoría no encontrada');
    return { success: true, data: rows[0] };
  }

  async create(body: any, file: any, user: any, req: any) {
    const { nombre, descripcion, color } = body;
    const imagen = file ? `/uploads/${file.filename}` : null;
    const { ip } = this.logger.getClientInfo(req);

    if (!nombre) throw new BadRequestException('El nombre es requerido');

    const [result] = await this.db.query(
      'INSERT INTO categorias (nombre, descripcion, imagen, color) VALUES (?,?,?,?)',
      [nombre, descripcion || null, imagen, color || '#FFB6C1'],
    );
    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Creó categoría: ${nombre}`, modulo: 'Categorías', ip });
    const [newCat] = await this.db.query('SELECT * FROM categorias WHERE id = ?', [result.insertId]);
    return { success: true, data: newCat[0], message: 'Categoría creada' };
  }

  async update(id: string, body: any, file: any, user: any, req: any) {
    const { nombre, descripcion, color, activo } = body;
    const { ip } = this.logger.getClientInfo(req);

    const [existing] = await this.db.query('SELECT * FROM categorias WHERE id = ? AND eliminado = 0', [id]);
    if (existing.length === 0) throw new NotFoundException('Categoría no encontrada');

    let imagen = existing[0].imagen;
    if (file) imagen = `/uploads/${file.filename}`;

    await this.db.query(
      'UPDATE categorias SET nombre=?, descripcion=?, imagen=?, color=?, activo=? WHERE id=?',
      [nombre || existing[0].nombre, descripcion ?? existing[0].descripcion, imagen,
       color || existing[0].color, activo !== undefined ? activo : existing[0].activo, id],
    );
    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Actualizó categoría: ${nombre}`, modulo: 'Categorías', ip });
    const [updated] = await this.db.query('SELECT * FROM categorias WHERE id = ?', [id]);
    return { success: true, data: updated[0], message: 'Categoría actualizada' };
  }

  async remove(id: string, user: any, req: any) {
    const { ip } = this.logger.getClientInfo(req);
    const [existing] = await this.db.query('SELECT * FROM categorias WHERE id = ? AND eliminado = 0', [id]);
    if (existing.length === 0) throw new NotFoundException('Categoría no encontrada');
    await this.db.query('UPDATE categorias SET eliminado = 1, eliminado_at = NOW() WHERE id = ?', [id]);
    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Eliminó categoría: ${existing[0].nombre}`, modulo: 'Categorías', ip });
    return { success: true, message: 'Categoría eliminada' };
  }
}
