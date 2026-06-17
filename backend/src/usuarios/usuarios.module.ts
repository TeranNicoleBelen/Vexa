import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { LoggerService } from '../common/logger.service';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService, LoggerService],
})
export class UsuariosModule {}
