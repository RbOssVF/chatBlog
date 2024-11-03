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

    @Get('listaUsuariosConectados')
    @UseGuards(JwtAuthGuard)
    async getUsuariosConectados(
        @Req() req: any,
        @Res() res: Response,
    ){
        try {
            
            const idUsuario = req.usuario.id;

            const listaConectadosQuery = await this.amigosRepository
                .createQueryBuilder('a') // Alias 'a' para 'amigos'
                .select([
                    'u.id AS id',
                    'u.nombreUsuario AS nombreUsuario',
                    'u.perfil AS perfil',
                    'COALESCE(du.conectado, 1) AS conectado'
                ])
                .innerJoin('usuario', 'u', '(u.id = a.usuario2Id OR u.id = a.usuario1Id)')
                .innerJoin('datosUsuario', 'du', '(du.usuarioId = a.usuario1Id OR du.usuarioId = a.usuario2Id)')
                .where('(a.usuario1Id = :userId OR a.usuario2Id = :userId)', { userId: idUsuario })
                .andWhere('u.id != :userId', { userId: idUsuario })
                .orderBy('conectado', 'DESC') // Referencia 'conectado' en lugar de COALESCE(du.conectado, 1)
                .getRawMany();

            const listaConectados = await Promise.all(
                listaConectadosQuery.map(async (amigo) => {

                    const v_mensajes = await this.mensajesRepository.find({
                        where: [
                            { emisorId: idUsuario, receptorId: amigo.id },
                            { emisorId: amigo.id, receptorId: idUsuario },
                        ]
                    });
            
                    // Verificar si hay mensajes entre los usuarios
                    const existeMensaje = v_mensajes.length > 0;

                    return {
                        id: Number(amigo.id),
                        nombreUsuario: amigo.nombreUsuario,
                        perfil: amigo.perfil,
                        estado: amigo.conectado,
                        existe: existeMensaje
                    };
                })
            );

            return res.status(HttpStatus.OK).json({
                estado: true,
                message: 'Usuarios conectados',
                listaConectados
            })

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: `Error al enviar la solicitud: ${error}`,
            })
        }
    }

    @Get('nuevosUsuariosRegistrado')
    @UseGuards(JwtAuthGuard)
    async obtenerNuevoUsuarioRegistrado(
        @Req() req: any,
        @Res() res: Response,
    ){
        try {

            const userId = req.usuario.id;

            const listaNuevosUsuariosQuery = await this.usuarioRepository
                .createQueryBuilder('u')
                .select([
                    'u.id AS id',
                    'u.nombreUsuario AS nombreUsuario',
                    'u.perfil AS perfil',
                    `COALESCE((SELECT du.conectado FROM datosUsuario du WHERE du.usuarioId = u.id), 1) AS conectado`
                ])
                .where('u.id != :userId', { userId })
                .andWhere(qb => {
                    const subQueryAmigos = qb.subQuery()
                        .select('CASE WHEN a.usuario1Id = :userId THEN a.usuario2Id ELSE a.usuario1Id END')
                        .from('amigos', 'a')
                        .where('a.usuario1Id = :userId OR a.usuario2Id = :userId')
                        .getQuery();

                    const subQueryAmistades = qb.subQuery()
                        .select('CASE WHEN a2.usuarioSolid = :userId THEN a2.usuarioRecId ELSE a2.usuarioSolid END')
                        .from('amistades', 'a2')
                        .where('a2.usuarioSolid = :userId OR a2.usuarioRecId = :userId')
                        .getQuery();

                    return `u.id NOT IN ${subQueryAmigos} AND u.id NOT IN ${subQueryAmistades}`;
                })
                .setParameter('userId', userId)
                .orderBy('u.fechaCreacion', 'DESC')
                .limit(3)  // Limita los resultados a 3 filas
                .getRawMany();

            return res.status(HttpStatus.OK).json({
                estado: true,
                listaNuevosUsuarios: listaNuevosUsuariosQuery
            })
            
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: `Error al enviar la solicitud: ${error}`,
            })
        }
    }

}

