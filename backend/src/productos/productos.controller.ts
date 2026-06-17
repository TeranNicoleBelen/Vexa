import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductosService } from './productos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { multerOptions } from '../middleware/upload.middleware';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  getAll(@Query() query: any) {
    return this.productosService.getAll(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productosService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendedor')
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.productosService.create(body, file, req.user, req);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendedor')
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.productosService.update(id, body, file, req.user, req);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productosService.remove(id, req.user, req);
  }
}
