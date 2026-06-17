import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  getAll(@Query() query: any, @Req() req: any) {
    return this.pedidosService.getAll(query, req.user);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Req() req: any) {
    return this.pedidosService.getById(id, req.user);
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.pedidosService.create(body, req.user, req);
  }

  @Put(':id/estado')
  @UseGuards(RolesGuard)
  @Roles('admin', 'vendedor')
  updateEstado(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.pedidosService.updateEstado(id, body, req.user, req);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.pedidosService.remove(id, req.user, req);
  }
}
