import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../common/logger.service';

const generateCode = () => 'VX-' + Date.now().toString().slice(-8);

@Injectable()
export class PedidosService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  async getAll(query: any, user: any) {
    const { estado, cliente_id, page = 1, limit = 20 } = query;
    let q = `
      SELECT pe.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.email as cliente_email
      FROM pedidos pe JOIN usuarios u ON pe.cliente_id = u.id
      WHERE pe.eliminado = 0
    `;
    const params: any[] = [];
    if (user.rol_nombre === 'cliente') { q += ' AND pe.cliente_id = ?'; params.push(user.id); }
    if (estado) { q += ' AND pe.estado = ?'; params.push(estado); }
    if (cliente_id && user.rol_nombre !== 'cliente') { q += ' AND pe.cliente_id = ?'; params.push(cliente_id); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    q += ` ORDER BY pe.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    const result: any = await this.db.query(q, params);
    const rows: any[] = result[0];
    return { success: true, data: rows };
  }

  async getById(id: string, user: any) {
    const res1: any = await this.db.query(
      'SELECT pe.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.email as cliente_email, u.telefono as cliente_telefono FROM pedidos pe JOIN usuarios u ON pe.cliente_id = u.id WHERE pe.id = ? AND pe.eliminado = 0',
      [id],
    );
    const pedidos: any[] = res1[0];
    if (pedidos.length === 0) throw new NotFoundException('Pedido no encontrado');

    const pedido = pedidos[0];
    if (user.rol_nombre === 'cliente' && pedido.cliente_id !== user.id) {
      throw new BadRequestException('No autorizado');
    }

    const res2: any = await this.db.query(
      'SELECT dp.*, p.nombre as producto_nombre, p.imagen as producto_imagen FROM detalle_pedidos dp JOIN productos p ON dp.producto_id = p.id WHERE dp.pedido_id = ?',
      [id],
    );
    const detalles: any[] = res2[0];

    return { success: true, data: { ...pedido, detalles } };
  }

  async create(body: any, user: any, req: any) {
    const { items, metodo_pago, tipo_entrega, direccion_envio, ciudad, zona, referencia, telefono_contacto, notas } = body;
    const { ip } = this.logger.getClientInfo(req);

    if (!items || items.length === 0) throw new BadRequestException('El carrito esta vacio');
    if (!metodo_pago || !tipo_entrega) throw new BadRequestException('Metodo de pago y tipo de entrega son requeridos');

    const conn: any = await this.db.getConnection();
    try {
      await conn.beginTransaction();

      let subtotal = 0;
      const detalles: any[] = [];

      for (const item of items) {
        const r: any = await conn.query('SELECT * FROM productos WHERE id = ? AND activo = 1 AND eliminado = 0', [item.producto_id]);
        const prods: any[] = r[0];
        if (prods.length === 0) throw new Error(`Producto ${item.producto_id} no disponible`);
        const prod = prods[0];
        if (prod.stock < item.cantidad) throw new Error(`Stock insuficiente para ${prod.nombre}`);
        const sub = prod.precio * item.cantidad;
        subtotal += sub;
        detalles.push({ producto_id: item.producto_id, cantidad: item.cantidad, precio_unitario: prod.precio, subtotal: sub });
      }

      const costo_envio = (tipo_entrega === 'envio' && subtotal < 200) ? 15 : 0;
      const total = subtotal + costo_envio;
      const codigo = generateCode();

      const ins: any = await conn.query(
        'INSERT INTO pedidos (cliente_id, total, subtotal, costo_envio, metodo_pago, tipo_entrega, estado, direccion_envio, ciudad, zona, referencia, telefono_contacto, notas, codigo_pedido) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [user.id, total, subtotal, costo_envio, metodo_pago, tipo_entrega, 'pendiente', direccion_envio || null, ciudad || null, zona || null, referencia || null, telefono_contacto || null, notas || null, codigo],
      );
      const insertedId: number = ins[0].insertId;

      for (const det of detalles) {
        await conn.query(
          'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)',
          [insertedId, det.producto_id, det.cantidad, det.precio_unitario, det.subtotal],
        );
        await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [det.cantidad, det.producto_id]);
      }

      await conn.query('DELETE FROM carrito WHERE usuario_id = ?', [user.id]);
      await conn.commit();
      await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Creo pedido: ${codigo}`, modulo: 'Pedidos', ip });

      return { success: true, data: { id: insertedId, codigo, total }, message: 'Pedido creado exitosamente' };
    } catch (err) {
      await conn.rollback();
      throw new BadRequestException(err.message || 'Error al crear pedido');
    } finally {
      conn.release();
    }
  }

  async updateEstado(id: string, body: any, user: any, req: any) {
    const { estado } = body;
    const { ip } = this.logger.getClientInfo(req);
    const estados = ['pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado', 'cancelado'];

    if (!estados.includes(estado)) throw new BadRequestException('Estado invalido');

    const res: any = await this.db.query('SELECT * FROM pedidos WHERE id = ? AND eliminado = 0', [id]);
    const existing: any[] = res[0];
    if (existing.length === 0) throw new NotFoundException('Pedido no encontrado');

    await this.db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Actualizo estado pedido #${id} a: ${estado}`, modulo: 'Pedidos', ip });

    return { success: true, message: 'Estado actualizado' };
  }

  async remove(id: string, user: any, req: any) {
    const { ip } = this.logger.getClientInfo(req);
    await this.db.query('UPDATE pedidos SET eliminado = 1, eliminado_at = NOW() WHERE id = ?', [id]);
    await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: `Elimino pedido #${id}`, modulo: 'Pedidos', ip });
    return { success: true, message: 'Pedido eliminado' };
  }
}