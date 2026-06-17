import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { LoggerService } from '../common/logger.service';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService, LoggerService],
})
export class PedidosModule {}
