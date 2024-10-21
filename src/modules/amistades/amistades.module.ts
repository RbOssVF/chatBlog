import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../entidades/usuario.entity';
import { Rol } from '../../entidades/rol.entity';
import { DatosUsuario } from 'src/entidades/datosUsuario.entity';
import { Amistades, Amigos, Mensajes } from '../../entidades/amigosUsuario.entity';
import { AmistadesController } from './amistades.controller';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol, DatosUsuario, Amistades, Amigos, Mensajes]),
  ], // Importamos el entity Usuario
  controllers: [AmistadesController],
  providers: [WebsocketGateway]
})
export class AmistadesModule {}