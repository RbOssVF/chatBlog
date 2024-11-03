import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../entidades/usuario.entity';
import { Rol } from '../../entidades/rol.entity';
import { DatosUsuario } from 'src/entidades/datosUsuario.entity';
import { UsuarioController } from './usuario.controller';
import { RolController } from './rol.controller'

import { WebsocketGateway } from '../websocket/websocket.gateway';
import { Amistades, Amigos } from 'src/entidades/amigosUsuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol, DatosUsuario, Amistades, Amigos]),
  ], // Importamos el entity Usuario
  controllers: [UsuarioController, RolController],
  providers: [WebsocketGateway]
})
export class UsuarioModule {}