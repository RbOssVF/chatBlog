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
}

