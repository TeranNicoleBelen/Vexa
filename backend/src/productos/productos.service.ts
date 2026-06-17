import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class ProductosService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  async getAll(query: any) {
    const { categoria_id, activo, search, page = 1, limit = 20 } = query;
    let q = `
      SELECT p.*, c.nombre as categoria_nombre, c.color as categoria_color
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.eliminado = 0
    `;
    const params: any[] = [];

    if (categoria_id) { q += ' AND p.categoria_id = ?'; params.push(categoria_id); }
    if (activo !== undefined) { q += ' AND p.activo = ?'; params.push(activo); }
    if (search) {
      q += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    q += ` ORDER BY p.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const [rows] = await this.db.query(q, params);

    let countQuery = 'SELECT COUNT(*) as total FROM productos p WHERE p.eliminado = 0';
    const countParams: any[] = [];
    if (categoria_id) { countQuery += ' AND p.categoria_id = ?'; countParams.push(categoria_id); }
    if (activo !== undefined) { countQuery += ' AND p.activo = ?'; countParams.push(activo); }
    if (search) {
      countQuery += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)';
      const s = `%${search}%`;
      countParams.push(s, s, s);
    }

    const [countRows] = await this.db.query(countQuery, countParams);
    return {
      success: true,
      data: rows,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  async getById(id: string) {
    const [rows] = await this.db.query(
      'SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ? AND p.eliminado = 0',
      [id],
    );
    if (rows.length === 0) throw new NotFoundException('Producto no encontrado');
    return { success: true, data: rows[0] };
  }

  async create(body: any, file: any, user: any, req: any) {
    const { nombre, descripcion, precio, stock, stock_minimo, categoria_id, marca, codigo } = body;
    const imagen = file ? `/uploads/${file.filename}` : null;
    const { ip } = this.logger.getClientInfo(req);

    if (!nombre || !precio || !stock || !categoria_id) {
      throw new BadRequestException('Nombre, precio, stock y categoría son requeridos');
    }

    const [result] = await this.db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo, categoria_id, imagen, marca, codigo) VALUES (?,?,?,?,?,?,?,?,?)',
      [nombre, descripcion || null, precio, stock, stock_minimo || 5, categoria_id, imagen, marca || null, codigo || null],
    );

    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Creó producto: ${nombre}`, modulo: 'Productos', ip });

    const [newProd] = await this.db.query(
      'SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?',
      [result.insertId],
    );
    return { success: true, data: newProd[0], message: 'Producto creado exitosamente' };
  }

  async update(id: string, body: any, file: any, user: any, req: any) {
    const { nombre, descripcion, precio, stock, stock_minimo, categoria_id, marca, codigo, activo } = body;
    const { ip } = this.logger.getClientInfo(req);

    const [existing] = await this.db.query('SELECT * FROM productos WHERE id = ? AND eliminado = 0', [id]);
    if (existing.length === 0) throw new NotFoundException('Producto no encontrado');

    let imagen = existing[0].imagen;
    if (file) {
      if (imagen) {
        const oldPath = path.join(__dirname, '../../', imagen);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imagen = `/uploads/${file.filename}`;
    }

    await this.db.query(
      'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, stock_minimo=?, categoria_id=?, imagen=?, marca=?, codigo=?, activo=? WHERE id=?',
      [nombre || existing[0].nombre, descripcion ?? existing[0].descripcion, precio || existing[0].precio,
       stock ?? existing[0].stock, stock_minimo ?? existing[0].stock_minimo, categoria_id || existing[0].categoria_id,
       imagen, marca ?? existing[0].marca, codigo ?? existing[0].codigo,
       activo !== undefined ? activo : existing[0].activo, id],
    );

    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Actualizó producto: ${nombre || existing[0].nombre}`, modulo: 'Productos', ip });

    const [updated] = await this.db.query(
      'SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?',
      [id],
    );
    return { success: true, data: updated[0], message: 'Producto actualizado' };
  }

  async remove(id: string, user: any, req: any) {
    const { ip } = this.logger.getClientInfo(req);
    const [existing] = await this.db.query('SELECT * FROM productos WHERE id = ? AND eliminado = 0', [id]);
    if (existing.length === 0) throw new NotFoundException('Producto no encontrado');

    await this.db.query('UPDATE productos SET eliminado = 1, eliminado_at = NOW(), activo = 0 WHERE id = ?', [id]);
    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Eliminó producto: ${existing[0].nombre}`, modulo: 'Productos', ip });

    return { success: true, message: 'Producto eliminado correctamente' };
  }
}
