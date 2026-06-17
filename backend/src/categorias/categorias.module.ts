import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { LoggerService } from '../common/logger.service';

@Module({
  controllers: [CategoriasController],
  providers: [CategoriasService, LoggerService],
})
export class CategoriasModule {}
