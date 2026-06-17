import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriasService } from './categorias.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { multerOptions } from '../middleware/upload.middleware';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  getAll(@Query() query: any) {
    return this.categoriasService.getAll(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.categoriasService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendedor')
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.categoriasService.create(body, file, req.user, req);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendedor')
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.categoriasService.update(id, body, file, req.user, req);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.categoriasService.remove(id, req.user, req);
  }
}
