import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { LoggerService } from '../common/logger.service';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService, LoggerService],
})
export class ProductosModule {}
