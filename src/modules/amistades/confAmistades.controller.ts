import { Controller, Get, Injectable, Post, Body, Res, HttpStatus, Param, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amistades, Amigos, Mensajes } from '../../entidades/amigosUsuario.entity';
import { Usuario } from '../../entidades/usuario.entity';
import { DatosUsuario } from 'src/entidades/datosUsuario.entity';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard'
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { Response } from 'express';

@Injectable() // Servicio y controlador en un solo archivo
@Controller('confAmistad')
export class ConfAmistadController {
    constructor(
        @InjectRepository(Amistades)
        private readonly amistadRepository: Repository<Amistades>,

        @InjectRepository(Amigos)
        private readonly amigosRepository: Repository<Amigos>,

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,

        @InjectRepository(DatosUsuario)
        private readonly datosUsuarioRepository: Repository<DatosUsuario>,

        @InjectRepository(Mensajes)
        private readonly mensajesRepository: Repository<Mensajes>,

        private readonly WebSocketGateway: WebsocketGateway
    ) {}

    @Get('listaAmistades')
    @UseGuards(JwtAuthGuard)
    async getAmistades(
        @Req() req: any,
        @Res() res: Response,
    ){
        try {
            
            const idUsuario = req.usuario.id;
            const listaAmigosQuery = await this.amistadRepository.query(`
                SELECT 
                    u.id AS id,
                    u.nombreUsuario AS nombreUsuario,
                    u.perfil AS perfil, 
                    du.conectado AS estado 
                FROM 
                    amigos a 
                INNER JOIN 
                    usuario u ON u.id = a.usuario2Id
                OR 
                    u.id = a.usuario1Id 
                INNER JOIN datosUsuario du 
                    ON du.usuarioId = a.usuario1Id 
                OR 
                    du.usuarioId = a.usuario2Id 
                WHERE 
                    (a.usuario1Id = ? OR a.usuario2Id = ?)
                    AND u.id != ?
                `, [idUsuario, idUsuario, idUsuario]);

            const listaAmigos = await Promise.all(
                listaAmigosQuery.map(async (amigo) => {
                    return {
                        id: amigo.id,
                        nombreUsuario: amigo.nombreUsuario,
                        perfil: amigo.perfil,
                        estado : amigo.estado
                    };
                })
            );

            return res.status(HttpStatus.OK).json({
                estado: true,
                message: 'Amistades encontradas',
                icono: 'success',
                listaAmigos
            })

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: 'Error al enviar la solicitud',
                icono: 'error',
            }) 
        }
    }

    @Get('listaAmistadesUsuario/:idUsuario')
    @UseGuards(JwtAuthGuard)
    async getAmistadesUsuario(
        @Req() req: any,
        @Res() res: Response,
        @Param() kwargs: { idUsuario: number }
    ) {
        try {
            const idUsuario = req.usuario.id;

            const listaAmigosQuery = await this.amistadRepository.query(`
                SELECT 
                    u.id AS id,
                    u.nombreUsuario AS nombreUsuario,
                    u.perfil AS perfil, 
                    du.conectado AS estado 
                FROM 
                    amigos a 
                INNER JOIN 
                    usuario u ON u.id = a.usuario2Id
                OR 
                    u.id = a.usuario1Id 
                INNER JOIN datosUsuario du 
                    ON du.usuarioId = a.usuario1Id 
                OR 
                    du.usuarioId = a.usuario2Id 
                WHERE 
                    (a.usuario1Id = ? OR a.usuario2Id = ?)
                    AND u.id != ?
                `, [kwargs.idUsuario, kwargs.idUsuario, kwargs.idUsuario]);

            const listaAmigos = await Promise.all(
                listaAmigosQuery.map(async (amigo) => {
                    return {
                        id: amigo.id,
                        nombreUsuario: amigo.nombreUsuario,
                        perfil: amigo.perfil,
                        estado: amigo.estado,
                    };
                })
            );

            return res.status(HttpStatus.OK).json({
                estado: true,
                message: 'Amistades encontradas',
                listaAmigos,
                usuarioLogueado: idUsuario
            })

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: 'Error al enviar la solicitud',
            })
        }
    }

    @Post('borrarAmistad/:idAmigo')
    @UseGuards(JwtAuthGuard)
    async borrarAmistad(
        @Req() req: any,
        @Res() res: Response,
        @Param() kwargs: { idAmigo: number }
    ) {
        try {
            
            const idUsuario = req.usuario.id;

            const v_amigo = await this.amigosRepository
                .createQueryBuilder('amigos')
                .where('(amigos.usuario1Id = :idUsuario AND amigos.usuario2Id = :idAmigo)', { idUsuario, idAmigo: kwargs.idAmigo })
                .orWhere('(amigos.usuario1Id = :idAmigo AND amigos.usuario2Id = :idUsuario)', { idUsuario, idAmigo: kwargs.idAmigo })
                .getOne();

            if (!v_amigo) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    estado: false,
                    message: 'El amigo no existe',
                    icono: 'warning',
                });
            }

            await this.amigosRepository
                .createQueryBuilder()
                .delete()
                .from('amigos') // Asegúrate de que 'amigos' es el nombre correcto de tu entidad en la base de datos
                .where(
                    '(amigos.usuario1Id = :idUsuario AND amigos.usuario2Id = :idURecep)',
                    { idUsuario, idURecep: kwargs.idAmigo }
                )
                .orWhere(
                    '(amigos.usuario1Id = :idURecep AND amigos.usuario2Id = :idUsuario)',
                    { idUsuario, idURecep: kwargs.idAmigo }
                )
                .execute();

            await this.mensajesRepository
                .createQueryBuilder()
                .delete()
                .from('mensajes') // Reemplaza 'Mensaje' con tu entidad de mensajes si es necesario
                .where(
                    '(emisorId = :idUsuario AND receptorId = :idURecep) OR (emisorId = :idURecep AND receptorId = :idUsuario)',
                    { idUsuario, idURecep: kwargs.idAmigo }
                )
                .execute();

            return res.status(HttpStatus.OK).json({
                estado: true,
                message: 'Amistad eliminada',
                icono: 'success',
            })

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: 'Error al enviar la solicitud',
                icono: 'error',
            })
        }
    }

}

