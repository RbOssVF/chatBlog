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
            
                    // Verificar si ya existen mensajes entre los usuarios
                    const v_mensajes = await this.mensajesRepository.find({
                        where: [
                            { emisorId: idUsuario, receptorId: amigoData.id },
                            { emisorId: amigoData.id, receptorId: idUsuario },
                        ]
                    });
            
                    // Verificar si hay mensajes entre los usuarios
                    const existeMensaje = v_mensajes.length > 0;
            
                    return {
                        id: amigoData.id,
                        nombres: amigoData.nombres,
                        apellidos: amigoData.apellidos,
                        nombreUsuario: amigoData.nombreUsuario,
                        estado: estadoUsuario?.conectado || true, // Control nulo con operador de coalescencia
                        perfil: amigoData.perfil,
                        existe: existeMensaje, // true si ya existen mensajes, false si no
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
            const g_usuarios_mensajes = await this.mensajesRepository
                .createQueryBuilder('mensajes')
                .innerJoin('usuario', 'u', 'u.id = mensajes.receptorId')
                .select('DISTINCT u')  // Selecciona todos los campos de la tabla usuario
                .where('mensajes.emisorId = :idUsuario', { idUsuario })
                .getMany();

            
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: `Error al obtener la lista de usuarios: ${error.message}`,
            });
        }
    }

    @Post('empezarChat/:idURecep')
    @UseGuards(JwtAuthGuard)
    async empezarChat(
        @Req() req: any,
        @Res() res: Response,
        @Param() id: { idURecep: number },
        @Body() body: { texto: string }
    ) {
        try {
            const idUsuario = req.usuario.id;
            const fechaMensaje = new Date();

            const v_receptor = await this.usuarioRepository.findOne({ where: { id: id.idURecep } });
            if (!v_receptor) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    estado: false,
                    message: `El receptor no existe`,
                    icono: 'error',
                });
            }

            const crear_mensaje = this.mensajesRepository.create({
                emisorId: idUsuario,
                receptorId: id.idURecep,
                texto: body.texto,
                fecha: fechaMensaje
            });

            await this.mensajesRepository.save(crear_mensaje);

            return res.status(HttpStatus.OK).json({
                estado: true,
                message: 'Chat iniciado correctamente',
                icono: 'success',
            });

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: `Error al obtener la lista de usuarios: ${error.message}`,
                icono: 'error',
            });
        }
        
    }

    @Get('verChat/:idUsuarioRecep')
    @UseGuards(JwtAuthGuard)
    async verChat(
        @Req() req: any,
        @Res() res: Response,
        @Param() receptor: { idUsuarioRecep: number }
    ) {
        try {
            
            const idUsuario = req.usuario.id;
            const g_mensajes = await this.mensajesRepository.find({
                where: [
                    { emisorId: idUsuario, receptorId: receptor.idUsuarioRecep },
                    { emisorId: receptor.idUsuarioRecep, receptorId: idUsuario },
                ],
                order: { fecha: 'ASC' }, // Ordenar por fecha ascendente para mostrar cronológicamente
            });

            const gDatosRecep = await this.usuarioRepository.findOne({ where: { id: receptor.idUsuarioRecep } });

            if (!gDatosRecep) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    estado: false,
                    message: `El receptor no existe`,
                })
            }

            const datosRecep = {
                id : gDatosRecep.id,
                nombreUsuario : gDatosRecep.nombreUsuario,
                perfil : gDatosRecep.perfil,
            }

            const mensajes = g_mensajes.map((mensaje) => {
                const fecha_format = formatearFechaRelativa(new Date(mensaje.fecha));
                return {
                    id: mensaje.id,
                    emisorId: mensaje.emisorId,
                    receptorId: mensaje.receptorId,
                    idUsuario : idUsuario,
                    texto: mensaje.texto,
                    fecha: fecha_format,
                };
            });


            return res.status(HttpStatus.OK).json({
                estado: true,
                mensajes,
                datosRecep
            });

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: `Error al obtener la lista de usuarios: ${error.message}`,
            })
        }    
    }

    @Post('nuevoMensaje/:idUsuarioRecep')
    @UseGuards(JwtAuthGuard)
    async nuevoAmistad(
        @Req() req: any,
        @Res() res: Response,
        @Param() receptor: { idUsuarioRecep: number },
        @Body() cuerpo: { texto: string }
    ) {
        try {
            const idUsuario = req.usuario.id;
            const v_receptor = await this.usuarioRepository.findOne({ where: { id: receptor.idUsuarioRecep } });
            if (!v_receptor) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    estado: false,
                    message: `El receptor no existe`,
                })
            }

            const nuevo_mensaje = this.mensajesRepository.create({
                emisorId: idUsuario,
                receptorId: v_receptor.id,
                texto: cuerpo.texto,
                fecha: new Date()
            });

            await this.mensajesRepository.save(nuevo_mensaje);

            return res.status(HttpStatus.OK).json({
                estado: true,
                message: 'Mensaje enviado correctamente',
            })

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                estado: false,
                message: `Error al obtener la lista de usuarios: ${error.message}`,
            })
        }    
    }
    
}


function formatearFechaRelativa (fecha: Date) {
    const now = new Date();
    const difference = now.getTime() - fecha.getTime(); // Diferencia en milisegundos

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
        return "Ahora";
    } else if (minutes < 60) {
        return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (hours < 24) {
        return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (days < 7) {
        return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    } else if (weeks < 4) {
        return `Hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
    } else if (months < 12) {
        return `Hace ${months} mes${months !== 1 ? 'es' : ''}`;
    } else {
        return `Hace ${years} año${years !== 1 ? 's' : ''}`;
    }
}
