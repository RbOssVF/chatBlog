import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './modules/usuarios/usuario.module'; 
import { WebsocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    WebsocketModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '192.168.1.50',
      port: 3306,
      username: 'rbhome',
      password: '$817W`Vg3{U|',
      database: 'blogCole',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Mantén false si estás usando migraciones
    }),
    UsuarioModule
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
