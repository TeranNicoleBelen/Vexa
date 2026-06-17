import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  getAll(@Query() query: any) {
    return this.usuariosService.getAll(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usuariosService.getById(id);
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.usuariosService.create(body, req.user, req);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.usuariosService.update(id, body, req.user, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.usuariosService.remove(id, req.user, req);
  }
}
