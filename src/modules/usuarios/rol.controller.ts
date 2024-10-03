import { Body, Controller, Get, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../../entidades/rol.entity';
import { Usuario } from '../../entidades/usuario.entity';
import { Response } from 'express';
import { JwtAuthGuard } from '../../jwt-auth.guard'

@Controller('rol')
export class RolController {
    constructor(
        @InjectRepository(Rol)
        private readonly rolRepository: Repository<Rol>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) {}

    async findAll(): Promise<Rol[]> {
        return this.rolRepository.find({ relations: ['usuarios'] });
    }

    @Get('listaRoles')
    // @UseGuards(JwtAuthGuard)
    async getAll(
        @Res() res: Response
    ) {
        try {
            const f_roles = await this.rolRepository.find();

            const roles = f_roles.map((rol) => {
                return {
                    id: rol.id,
                    nombre: rol.nombre,
                }
            });

            return res.status(HttpStatus.OK).json({
                estado: true,
                roles
            });

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: 'Error interno del servidor',
                error
            });
        }
    }

    @Get('obtenerRol/:idRol')
    async obtenerRol(
        @Res() res: Response,
        @Param('idRol') idRol: number
    ) 
    {
        try {

            const g_rol = await this.rolRepository.findOne({
                where: { id: idRol },
            })

            if (!g_rol) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    estado: false,
                    message: `El rol con ID ${idRol} no existe`,
                });
            }

            const rol = {
                id: g_rol.id,
                nombre: g_rol.nombre,
                estado : g_rol.estado === true ? 'Activo' : 'Inactivo',
                fechaCreacion: g_rol.fechaCreacion,
            }

            return res.status(HttpStatus.OK).json({
                estado: true,
                rol
            });

        }catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: 'Error interno del servidor',
                error
            });
        }
    }

    @Get('obtenerUsuariosRol/:idRol')
    async obtenerUsuariosRol(
        @Res() res: Response,
        @Param('idRol') idRol: number
    ) {
        try {
            const f_usuarios = await this.usuarioRepository.find({
                where: { rol: { id: idRol } },
                relations: ['rol'],
            });

            if (f_usuarios.length === 0) { // Comprobar si no se encontraron usuarios
                return res.status(HttpStatus.NOT_FOUND).json({
                    estado: false,
                    message: `No se encontraron usuarios para el rol con ID ${idRol}`,
                });
            }

            const usuariosRol = f_usuarios.map((usuario) => ({
                id: usuario.id,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                email: usuario.email,
                rol: usuario.rol.nombre,
            }));

            return res.status(HttpStatus.OK).json({
                estado: true,
                usuariosRol,
            });

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }

    @Post('nuevoRol')
    // @UseGuards(JwtAuthGuard)
    async nuevoRol(
        @Res() res: Response,
        @Body() rol: { nombre: string }
    ) 
    {
        try {
            
            if (!rol) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    estado: false,
                    message: 'Faltan datos'
                });
            }

            const nuevoRol = this.rolRepository.create({
                nombre: rol.nombre,
                fechaCreacion: new Date(),
            });

            const nuevoRolGuardado = await this.rolRepository.save(nuevoRol);

            return res.status(HttpStatus.OK).json({
                estado: true,
                message: `Rol ${nuevoRolGuardado.nombre} creado exitosamente`,
            });

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: 'Error interno del servidor',
                error
            });
        }
    }
}
