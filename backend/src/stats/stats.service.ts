import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import PDFDocument = require('pdfkit');
import { Response } from 'express';

@Injectable()
export class StatsService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboard() {
    const [[totalVentas]] = await this.db.query("SELECT COUNT(*) as total, SUM(total) as ingresos FROM pedidos WHERE estado != 'cancelado' AND eliminado = 0");
    const [[totalProductos]] = await this.db.query('SELECT COUNT(*) as total FROM productos WHERE eliminado = 0 AND activo = 1');
    const [[totalClientes]] = await this.db.query('SELECT COUNT(*) as total FROM usuarios WHERE rol_id = 3 AND eliminado = 0');
    const [[totalPendientes]] = await this.db.query("SELECT COUNT(*) as total FROM pedidos WHERE estado = 'pendiente' AND eliminado = 0");
    const [productosTopVentas] = await this.db.query('SELECT * FROM v_ventas_por_producto ORDER BY total_vendido DESC LIMIT 5');
    const [productosPocoStock] = await this.db.query('SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.stock <= p.stock_minimo AND p.eliminado = 0 ORDER BY p.stock ASC LIMIT 5');

    return {
      success: true,
      data: {
        totalVentas: totalVentas.total || 0,
        ingresos: totalVentas.ingresos || 0,
        totalProductos: totalProductos.total || 0,
        totalClientes: totalClientes.total || 0,
        totalPendientes: totalPendientes.total || 0,
        productosTopVentas,
        productosPocoStock,
      },
    };
  }

  async getVentasPorMes() {
    const [rows] = await this.db.query(`
      SELECT 
        YEAR(created_at) as año,
        MONTH(created_at) as mes,
        DATE_FORMAT(created_at, '%b %Y') as label,
        COUNT(*) as total_pedidos,
        SUM(total) as ingresos
      FROM pedidos
      WHERE estado != 'cancelado' AND eliminado = 0
      AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY año, mes
    `);
    return { success: true, data: rows };
  }

  async getProductosMasVendidos() {
    const [rows] = await this.db.query('SELECT * FROM v_ventas_por_producto ORDER BY total_vendido DESC LIMIT 10');
    return { success: true, data: rows };
  }

  async getClientesTop() {
    const [rows] = await this.db.query(`
      SELECT 
        u.id, u.nombre, u.apellido, u.email,
        MONTH(pe.created_at) as mes,
        YEAR(pe.created_at) as año,
        COUNT(pe.id) as total_pedidos,
        SUM(pe.total) as total_compras
      FROM usuarios u
      JOIN pedidos pe ON u.id = pe.cliente_id
      WHERE pe.estado != 'cancelado' AND pe.eliminado = 0
      AND pe.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY u.id, MONTH(pe.created_at), YEAR(pe.created_at)
      ORDER BY total_compras DESC
      LIMIT 10
    `);
    return { success: true, data: rows };
  }

  async getVentasPorCategoria() {
    const [rows] = await this.db.query(`
      SELECT 
        c.nombre as categoria,
        c.color,
        SUM(dp.cantidad) as total_vendido,
        SUM(dp.subtotal) as ingresos
      FROM categorias c
      JOIN productos p ON c.id = p.categoria_id
      JOIN detalle_pedidos dp ON p.id = dp.producto_id
      JOIN pedidos pe ON dp.pedido_id = pe.id AND pe.estado != 'cancelado'
      WHERE c.eliminado = 0
      GROUP BY c.id, c.nombre, c.color
      ORDER BY total_vendido DESC
    `);
    return { success: true, data: rows };
  }

  async getLogsAcceso(query: any) {
    const { page = 1, limit = 50, evento } = query;
    let q = 'SELECT la.*, u.nombre, u.apellido FROM log_acceso la LEFT JOIN usuarios u ON la.usuario_id = u.id WHERE 1=1';
    const params: any[] = [];
    if (evento) { q += ' AND la.evento = ?'; params.push(evento); }
    q += ` ORDER BY la.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}`;
    const [rows] = await this.db.query(q, params);
    return { success: true, data: rows };
  }

  async getLogsActividad(query: any) {
    const { page = 1, limit = 50, modulo } = query;
    let q = 'SELECT * FROM log_actividad WHERE 1=1';
    const params: any[] = [];
    if (modulo) { q += ' AND modulo = ?'; params.push(modulo); }
    q += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}`;
    const [rows] = await this.db.query(q, params);
    return { success: true, data: rows };
  }

  async reportePedidoPDF(id: string, res: Response) {
    const [pedidos] = await this.db.query(
      'SELECT pe.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.email as cliente_email FROM pedidos pe JOIN usuarios u ON pe.cliente_id = u.id WHERE pe.id = ?',
      [id],
    );
    if (pedidos.length === 0) throw new NotFoundException('Pedido no encontrado');

    const pedido = pedidos[0];
    const [detalles] = await this.db.query(
      'SELECT dp.*, p.nombre as producto_nombre FROM detalle_pedidos dp JOIN productos p ON dp.producto_id = p.id WHERE dp.pedido_id = ?',
      [id],
    );

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-vexa-${pedido.codigo_pedido}.pdf`);
    doc.pipe(res);

    doc.fontSize(28).fillColor('#E8637A').text('VEXA', { align: 'center' });
    doc.fontSize(12).fillColor('#666').text('Tienda de Limpieza & Belleza', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#999').text('Mercado Ciudad Satélite, El Alto, Bolivia | Tel: +591 60612998 | +591 73503017', { align: 'center' });
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#FFB6C1').lineWidth(2).stroke();
    doc.moveDown();

    doc.fontSize(16).fillColor('#333').text(`TICKET DE PEDIDO`, { align: 'center' });
    doc.fontSize(12).fillColor('#E8637A').text(`Código: ${pedido.codigo_pedido}`, { align: 'center' });
    doc.moveDown();

    const col1 = 50, col2 = 300;
    doc.fontSize(10).fillColor('#333');
    doc.text(`Cliente: ${pedido.cliente_nombre} ${pedido.cliente_apellido}`, col1);
    doc.text(`Email: ${pedido.cliente_email}`, col1);
    doc.text(`Fecha: ${new Date(pedido.created_at).toLocaleString('es-BO')}`, col1);
    doc.text(`Método de pago: ${pedido.metodo_pago.toUpperCase()}`, col2, doc.y - 30);
    doc.text(`Tipo entrega: ${pedido.tipo_entrega.toUpperCase()}`, col2);
    doc.text(`Estado: ${pedido.estado.toUpperCase()}`, col2);
    doc.moveDown();

    if (pedido.tipo_entrega === 'envio') {
      doc.fontSize(10).fillColor('#333');
      doc.text(`Dirección: ${pedido.direccion_envio || '-'}`, col1);
      doc.text(`Ciudad: ${pedido.ciudad || '-'} | Zona: ${pedido.zona || '-'}`, col1);
      doc.text(`Referencia: ${pedido.referencia || '-'}`, col1);
      doc.moveDown();
    } else {
      doc.fontSize(10).fillColor('#E8637A').text('Retiro en tienda: Av. Principal 123, La Paz', col1);
      doc.moveDown();
    }

    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#FFB6C1').lineWidth(1).stroke();
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor('#E8637A');
    doc.text('Producto', 50, doc.y, { width: 220 });
    doc.text('Cant.', 280, doc.y - 12, { width: 60, align: 'center' });
    doc.text('Precio', 350, doc.y - 12, { width: 90, align: 'right' });
    doc.text('Subtotal', 450, doc.y - 12, { width: 90, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#DDD').lineWidth(0.5).stroke();
    doc.moveDown(0.5);

    detalles.forEach((det: any) => {
      doc.fontSize(9).fillColor('#333');
      const y = doc.y;
      doc.text(det.producto_nombre, 50, y, { width: 220 });
      doc.text(det.cantidad.toString(), 280, y, { width: 60, align: 'center' });
      doc.text(`Bs ${parseFloat(det.precio_unitario).toFixed(2)}`, 350, y, { width: 90, align: 'right' });
      doc.text(`Bs ${parseFloat(det.subtotal).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      doc.moveDown(0.7);
    });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#FFB6C1').lineWidth(1).stroke();
    doc.moveDown(0.5);

    const y = doc.y;
    doc.fontSize(10).fillColor('#333');
    doc.text(`Subtotal:`, 350, y, { width: 90, align: 'right' });
    doc.text(`Bs ${parseFloat(pedido.subtotal).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
    doc.moveDown(0.4);
    doc.text(`Costo envío:`, 350, doc.y, { width: 90, align: 'right' });
    doc.text(`Bs ${parseFloat(pedido.costo_envio).toFixed(2)}`, 450, doc.y - 12, { width: 90, align: 'right' });
    doc.moveDown(0.4);
    doc.fontSize(13).fillColor('#E8637A');
    doc.text(`TOTAL:`, 350, doc.y, { width: 90, align: 'right' });
    doc.text(`Bs ${parseFloat(pedido.total).toFixed(2)}`, 450, doc.y - 15, { width: 90, align: 'right' });

    doc.moveDown(2);
    doc.fontSize(10).fillColor('#999').text('Gracias por tu compra en VEXA ♥', { align: 'center' });
    doc.fontSize(8).text('terannicole06@gmail.com | vexa.com.bo', { align: 'center' });

    doc.end();
  }

  async reporteVentasPDF(res: Response) {
    const [ventas] = await this.db.query(`
      SELECT pe.codigo_pedido, pe.total, pe.estado, pe.metodo_pago, pe.tipo_entrega,
             DATE_FORMAT(pe.created_at, '%d/%m/%Y %H:%i') as fecha,
             u.nombre, u.apellido, u.email
      FROM pedidos pe JOIN usuarios u ON pe.cliente_id = u.id
      WHERE pe.eliminado = 0 ORDER BY pe.created_at DESC LIMIT 100
    `);

    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas-vexa.pdf');
    doc.pipe(res);

    doc.fontSize(22).fillColor('#E8637A').text('VEXA', { align: 'center' });
    doc.fontSize(14).fillColor('#333').text('Reporte de Ventas', { align: 'center' });
    doc.fontSize(10).fillColor('#999').text(`Generado: ${new Date().toLocaleString('es-BO')}`, { align: 'center' });
    doc.moveDown();

    const headers = ['Código', 'Cliente', 'Email', 'Total (Bs)', 'Pago', 'Estado', 'Fecha'];
    const widths = [80, 100, 150, 70, 60, 80, 110];
    let x = 30;
    headers.forEach((h, i) => {
      doc.fontSize(9).fillColor('#E8637A').text(h, x, doc.y, { width: widths[i] });
      x += widths[i];
    });
    doc.moveDown(0.5);
    doc.moveTo(30, doc.y).lineTo(760, doc.y).strokeColor('#FFB6C1').stroke();
    doc.moveDown(0.5);

    ventas.forEach((v: any) => {
      x = 30;
      const y = doc.y;
      const row = [v.codigo_pedido, `${v.nombre} ${v.apellido}`, v.email, parseFloat(v.total).toFixed(2), v.metodo_pago, v.estado, v.fecha];
      row.forEach((cell, i) => {
        doc.fontSize(7).fillColor('#333').text(cell || '-', x, y, { width: widths[i] - 2 });
        x += widths[i];
      });
      doc.moveDown(0.6);
    });

    doc.end();
  }

  // Carrito
  async getCarrito(user: any) {
    const [rows] = await this.db.query(
      'SELECT c.*, p.nombre, p.precio, p.imagen, p.stock FROM carrito c JOIN productos p ON c.producto_id = p.id WHERE c.usuario_id = ?',
      [user.id],
    );
    return { success: true, data: rows };
  }

  async addToCarrito(body: any, user: any) {
    const { producto_id, cantidad = 1 } = body;
    const [existing] = await this.db.query('SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ?', [user.id, producto_id]);
    if (existing.length > 0) {
      await this.db.query('UPDATE carrito SET cantidad = cantidad + ? WHERE usuario_id = ? AND producto_id = ?', [cantidad, user.id, producto_id]);
    } else {
      await this.db.query('INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?,?,?)', [user.id, producto_id, cantidad]);
    }
    return { success: true, message: 'Producto agregado al carrito' };
  }

  async updateCarrito(id: string, body: any, user: any) {
    const { cantidad } = body;
    if (cantidad <= 0) {
      await this.db.query('DELETE FROM carrito WHERE id = ? AND usuario_id = ?', [id, user.id]);
    } else {
      await this.db.query('UPDATE carrito SET cantidad = ? WHERE id = ? AND usuario_id = ?', [cantidad, id, user.id]);
    }
    return { success: true };
  }

  async removeFromCarrito(id: string, user: any) {
    await this.db.query('DELETE FROM carrito WHERE id = ? AND usuario_id = ?', [id, user.id]);
    return { success: true };
  }
}
