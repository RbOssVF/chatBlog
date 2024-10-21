import { Controller, Get, Injectable, Post, Body, Res, HttpStatus, Param, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not  } from 'typeorm';
import { Amistades, Amigos, Mensajes } from '../../entidades/amigosUsuario.entity';
import { Usuario } from '../../entidades/usuario.entity';
import { DatosUsuario } from 'src/entidades/datosUsuario.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { Response } from 'express';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard'

@Injectable() // Servicio y controlador en un solo archivo
@Controller('amistades')
export class AmistadesController {
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

        private readonly websocketGateway: WebsocketGateway
    ) {}

    @Post('enviarSolicitud/:idAmigoFut')
    @UseGuards(JwtAuthGuard)
    async enviarSolicitud(
        @Req() req: any,
        @Res() res: Response,
        @Param() amistad: { idAmigoFut: number }
    ){
        try {
            
            const idUsuario = req.usuario.id;
            const g_amigo = await this.usuarioRepository.findOne({ where: { id: amistad.idAmigoFut } });
            if (!g_amigo) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    estado: false,
                    message: `El usuario no existe`,
                    icono: 'warning',
                });
            }

            const g_amistad = await this.amistadRepository.findOne({ where: { usuarioSolId: idUsuario, usuarioRecId: g_amigo.id } });

            if (g_amistad) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    estado: false,
                    message: `La solicitud ya ha sido enviada`,
                    icono: 'warning',
                });
            }

            const crear_amistad = this.amistadRepository.create({
                usuarioSolId: idUsuario,
                usuarioRecId: g_amigo.id,
                fechaSolicitud : new Date(),
            })

            await this.amistadRepository.save(crear_amistad);

            return res.status(HttpStatus.OK).json({
                estado: true,
                message: 'Solicitud enviada',
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

    @Get('solicitudes')
    @UseGuards(JwtAuthGuard)
    async solicitudes(
        @Req() req: any,
        @Res() res: Response
    ) {
        try {
            const idUsuario = req.usuario.id;
            const all_solicitudes = await this.amistadRepository.find({ where: { usuarioRecId: idUsuario, estado: 'Pendiente' }, relations: ['usuarioSol'] });

            const solicitudes = await Promise.all(
                all_solicitudes.map(async (solicitud) => {
                  // Obtener el estado del usuario solicitante
                  const estadoUsuario = await this.datosUsuarioRepository.findOne({
                    where: { usuario: {id : solicitud.usuarioSol.id } },
                  });
              
                  return {
                    id: solicitud.id,
                    idUsuarioSol: solicitud.usuarioSol.id,
                    nombres: solicitud.usuarioSol.nombres,
                    apellidos: solicitud.usuarioSol.apellidos,
                    fechaSol: solicitud.fechaSolicitud,
                    nombreUsuario: solicitud.usuarioSol.nombreUsuario,
                    estado: estadoUsuario.conectado, // Control de nulo
                    perfil: solicitud.usuarioSol.perfil,
                  };
                })
              );

            const total_solicitudes = all_solicitudes.length;

            return res.status(HttpStatus.OK).json({
                estado: true,
                message: 'Solicitudes encontradas',
                solicitudes: solicitudes,
                total: total_solicitudes,
            })

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: 'Error al buscar las solicitudes' + error,
                icono: 'error',
            })
        }
    }
    @Post('aceptarSolicitud/:idSolicitud')
    @UseGuards(JwtAuthGuard)
    async aceptarSolicitud(
        @Req() req: any,
        @Res() res: Response,
        @Param() amistad: { idSolicitud: number }
    ){
        try {
            const idUsuario = req.usuario.id;
            const g_amistad = await this.amistadRepository.findOne({ where: { id: amistad.idSolicitud } });
            if (!g_amistad) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    estado: false,
                    message: `La solicitud no existe`,
                    icono: 'warning',
                });
            }

            const regis_amigos = this.amigosRepository.create({
                usuario1Id: idUsuario,
                usuario2Id: g_amistad.usuarioSolId,
                fechaAmistad: new Date(),
            })

            await this.amigosRepository.save(regis_amigos);

            //eliminar la solicitud
            await this.amistadRepository.delete({ id: amistad.idSolicitud });

            return res.status(HttpStatus.OK).json({
                estado: true,
                message: 'Solicitud aceptada correctamente',
                icono: 'success',
            })

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: 'Error al aceptar la solicitud' + error,
                icono: 'error',
            })
        }
    }

    @Get('nuevoChat')
    @UseGuards(JwtAuthGuard)
    async nuevoChat(
        @Req() req: any,
        @Res() res: Response
    ) {
        try {
            const idUsuario = req.usuario.id;

            // Obtener todas las amistades donde el usuario sea usuario1 o usuario2
            const g_amigos = await this.amigosRepository.find({
                where: [
                    { usuario1: { id: idUsuario } },
                    { usuario2: { id: idUsuario } }
                ],
                relations: ['usuario1', 'usuario2'],
            });

            // Procesar las amistades y devolver los amigos excluyendo al propio usuario
            const amigos = await Promise.all(
                g_amigos.map(async (amigo) => {
                    // Determinar quién es el amigo (usuario1 o usuario2)
                    const amigoData = amigo.usuario1.id === idUsuario
                        ? amigo.usuario2
                        : amigo.usuario1;

                    // Obtener estado del usuario amigo
                    const estadoUsuario = await this.datosUsuarioRepository.findOne({
                        where: { usuario: { id: amigoData.id } },
                    });

                    return {
                        id: amigoData.id,
                        nombres: amigoData.nombres,
                        apellidos: amigoData.apellidos,
                        nombreUsuario: amigoData.nombreUsuario,
                        estado: estadoUsuario?.conectado || true, // Control nulo con operador de coalescencia
                        perfil: amigoData.perfil,
                    };
                })
            );

            return res.status(HttpStatus.OK).json({
                estado: true,
                amigos,
            });

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: `Error al obtener la lista de amigos: ${error.message}`,
            });
        }
    }

    @Get('listaMensajes')
    @UseGuards(JwtAuthGuard)
    async listaMensajes(
        @Req() req: any,
        @Res() res: Response
    ) {
        try {
            const idUsuario = req.usuario.id;

            // Obtener los últimos mensajes donde el usuario es emisor o receptor, ordenados por fecha
            const g_mensajes = await this.mensajesRepository
                .createQueryBuilder('mensaje')
                .where('mensaje.emisorId = :idUsuario OR mensaje.receptorId = :idUsuario', { idUsuario })
                .orderBy('mensaje.fecha', 'DESC')
                .leftJoinAndSelect('mensaje.emisor', 'emisor')
                .leftJoinAndSelect('mensaje.receptor', 'receptor')
                .getMany();

            // Filtrar los últimos mensajes únicos por contacto
            const mensajesUnicos = Array.from(
                new Map(
                    g_mensajes.map((mensaje) => {
                        const contactoId = mensaje.emisor.id === idUsuario
                            ? mensaje.receptor.id
                            : mensaje.emisor.id;
                        return [contactoId, mensaje];
                    })
                ).values()
            );

            // Formatear los contactos con el último mensaje
            const contactos = await Promise.all(
                mensajesUnicos.map(async (mensaje) => {
                    const contacto = mensaje.emisor.id === idUsuario
                        ? mensaje.receptor
                        : mensaje.emisor;

                    const estadoUsuario = await this.datosUsuarioRepository.findOne({
                        where: { usuario: { id: contacto.id } },
                    });

                    const minLength = 6;
                    const textoReducido = mensaje.texto.length >= minLength
                        ? mensaje.texto
                        : `${mensaje.texto.padEnd(minLength, '.')}...`;

                    return {
                        id: contacto.id,
                        nombreUsuario: contacto.nombreUsuario,
                        nombres: contacto.nombres,
                        apellidos: contacto.apellidos,
                        perfil: contacto.perfil,
                        ultimoMensaje: textoReducido,
                        fechaMensaje: mensaje.fecha,
                        estado: estadoUsuario?.conectado || false, // Control de nulo
                    };
                })
            );

            return res.status(HttpStatus.OK).json({
                estado: true,
                contactos,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: `Error al obtener la lista de usuarios: ${error.message}`,
            });
        }
    }
}