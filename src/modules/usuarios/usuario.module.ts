import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../entidades/usuario.entity';
import { Rol } from '../../entidades/rol.entity';
import { UsuarioController } from './usuario.controller';
import { RolController } from './rol.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol]),
  ], // Importamos el entity Usuario
  controllers: [UsuarioController, RolController],
})
export class UsuarioModule {}