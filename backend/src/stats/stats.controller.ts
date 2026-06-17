import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, Res, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Response } from 'express';

@Controller()
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // Estadísticas
  @Get('estadisticas/dashboard')
  @UseGuards(RolesGuard)
  @Roles('admin', 'vendedor')
  getDashboard() {
    return this.statsService.getDashboard();
  }

  @Get('estadisticas/ventas-por-mes')
  @UseGuards(RolesGuard)
  @Roles('admin', 'vendedor')
  getVentasPorMes() {
    return this.statsService.getVentasPorMes();
  }

  @Get('estadisticas/productos-mas-vendidos')
  @UseGuards(RolesGuard)
  @Roles('admin', 'vendedor')
  getProductosMasVendidos() {
    return this.statsService.getProductosMasVendidos();
  }

  @Get('estadisticas/clientes-top')
  @UseGuards(RolesGuard)
  @Roles('admin', 'vendedor')
  getClientesTop() {
    return this.statsService.getClientesTop();
  }

  @Get('estadisticas/ventas-por-categoria')
  @UseGuards(RolesGuard)
  @Roles('admin', 'vendedor')
  getVentasPorCategoria() {
    return this.statsService.getVentasPorCategoria();
  }

  // Logs
  @Get('logs/acceso')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getLogsAcceso(@Query() query: any) {
    return this.statsService.getLogsAcceso(query);
  }

  @Get('logs/actividad')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getLogsActividad(@Query() query: any) {
    return this.statsService.getLogsActividad(query);
  }

  // Reportes PDF
  @Get('reportes/pedido/:id')
  reportePedidoPDF(@Param('id') id: string, @Res() res: Response) {
    return this.statsService.reportePedidoPDF(id, res);
  }

  @Get('reportes/ventas')
  @UseGuards(RolesGuard)
  @Roles('admin', 'vendedor')
  reporteVentasPDF(@Res() res: Response) {
    return this.statsService.reporteVentasPDF(res);
  }

  // Carrito
  @Get('carrito')
  getCarrito(@Req() req: any) {
    return this.statsService.getCarrito(req.user);
  }

  @Post('carrito')
  addToCarrito(@Body() body: any, @Req() req: any) {
    return this.statsService.addToCarrito(body, req.user);
  }

  @Put('carrito/:id')
  updateCarrito(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.statsService.updateCarrito(id, body, req.user);
  }

  @Delete('carrito/:id')
  removeFromCarrito(@Param('id') id: string, @Req() req: any) {
    return this.statsService.removeFromCarrito(id, req.user);
  }
}
