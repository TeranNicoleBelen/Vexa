import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { StatsModule } from './stats/stats.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    AuthModule,
    ProductosModule,
    CategoriasModule,
    PedidosModule,
    UsuariosModule,
    StatsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
