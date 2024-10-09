import { Controller, Get, Injectable, Post, Body, Res, HttpStatus, Param, UseGuards, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entidades/usuario.entity';
import { Rol } from '../../entidades/rol.entity';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard'
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { timeout } from 'rxjs';

@Injectable() // Servicio y controlador en un solo archivo
@Controller('usuarios') // Ruta base: /usuarios
export class UsuarioController {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Rol)  // Inyectar el repositorio de Rol
    private readonly rolRepository: Repository<Rol>,

    private readonly websocketGateway: WebsocketGateway
  ) {}

  // Servicio: Obtener todos los usuarios
  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({ relations: ['rol'] });
  }

  // Controlador: Ruta GET para todos los usuarios
  @Get('listaUsuarios')
  @UseGuards(JwtAuthGuard)
  async getAll() {
    const all_usuarios = await this.findAll();
  
    const usuarios = all_usuarios.map((usuario) => {
      const formatearFecha = (fecha: Date) => {
        const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        });
        return fechaFormateada;
      };
  
      return {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        estado: usuario.estado === true ? 'Activo' : 'Inactivo',
        fechaCreacion: formatearFecha(usuario.fechaCreacion),
        rol: usuario.rol.nombre || 'Sin rol',
      };
    });
  
    return {
      estado: true,
      usuarios,
    };
  }

  @Post('registrarUsuario')
  async registrarUsuario(
    @Body() datosUsuario: {
      nombres: string,
      apellidos: string,
      email: string,
      clave: string,
      rolId: number,
      nombreUsuario: string
    }
  ) {
    try {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(datosUsuario.clave, 10);

      // Comprobar si el email ya está registrado
      const usuarioExistente = await this.usuarioRepository.findOne({
        where: { email: datosUsuario.email },
      });

      const nombreUsuarioExistente = await this.usuarioRepository.findOne({
        where: { nombreUsuario: datosUsuario.nombreUsuario },
      })

      let existeIp = false;
      let ipUsuario = '';

      while (!existeIp) {
        ipUsuario = generarIpUsuario();  // Llamar a la función para generar la IP
        const verificarIpUsuario = await this.usuarioRepository.findOne({
          where: { ipUser: ipUsuario },
        });
        if (!verificarIpUsuario) {
          existeIp = true;  // Si la IP no existe en la base de datos, usarla
        }
      }
      // let jsonMensaje = {};

      if (usuarioExistente) {

        return {
          estado: false,
          message: `El usuario con correo ${datosUsuario.email} ya existe.`,
          icono: 'warning',
        };
      }

      if (nombreUsuarioExistente) {
        return {
          estado: false,
          message: `El usuario con nombre de usuario ${datosUsuario.nombreUsuario} ya existe.`,
          icono: 'warning',
        }
      }
      // Comprobar si el rol existe
      const rolEncontrado = await this.rolRepository.findOne({
        where: { id: datosUsuario.rolId },
      });

      if (!rolEncontrado) {
        return {
          estado: false,
          message: `El rol con ID ${datosUsuario.rolId} no existe.`,
          icono: 'warning',
        };
      }

      // Crear el nuevo usuario
      const nuevoUsuario = this.usuarioRepository.create({
        nombres: datosUsuario.nombres,
        apellidos: datosUsuario.apellidos,
        email: datosUsuario.email,
        clave: hashedPassword,
        fechaCreacion: new Date(),
        ipUser : ipUsuario,
        nombreUsuario : datosUsuario.nombreUsuario,
        rol: rolEncontrado, // Asignar el rol encontrado
      });

      // Guardar el nuevo usuario en la base de datos
      const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

      //Uso de Websocket
      // this.websocketGateway.EnviarNotificaciones(jsonMensaje);

      return {
        estado: true,
        message: `Usuario ${usuarioGuardado.apellidos} ${usuarioGuardado.nombres} registrado exitosamente.`,
        icono: 'success',
      };
    } catch (error) {
      return {
        estado: false,
        message: `Error al registrar usuario: ${error.message}`,
        icono: 'error',
      };
    }
  }

  @Post('loginUsuario')
  async loginUsuario(
    @Res() res: Response,
    @Body() datosUsuario: { email: string, clave: string }
  ) {
    try {
      // Buscar el usuario por correo o por nombre de usuario
      const usuario = await this.usuarioRepository.findOne({
        where: [
          { email: datosUsuario.email },  // Buscar por correo electrónico
          { nombreUsuario: datosUsuario.email }  // Buscar por nombre de usuario
        ],
      });

      if (!usuario) {
        return res.status(HttpStatus.NOT_FOUND).json({
          estado: false,
          message: `El usuario ${datosUsuario.email} no existe`,
          icono: 'warning',
        });
      }

      // Verificar si la contraseña es correcta
      const v_contraseña = await bcrypt.compare(
        datosUsuario.clave,
        usuario.clave,
      );

      if (!v_contraseña) {
        return res.status(HttpStatus.NOT_FOUND).json({
          estado: false,
          message: `La contraseña es incorrecta`,
          icono: 'warning',
        });
      }

      // Generar el token JWT
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },  // Datos del payload del token
        process.env.JWT_SECRET || 'nestBlog2024.', // Llave secreta
        { expiresIn: '1h' }  // Expiración del token
      );

      // Enviar el token en una cookie segura
      res.cookie('token', token, { httpOnly: true, secure: false });  // Puedes usar secure: true en producción

      return res.status(HttpStatus.OK).json({
        estado: true,
        usuarioId: usuario.id,
        token,  // Solo si quieres enviar también el token en el JSON (por ejemplo, para apps móviles)
        message: `Usuario ${usuario.apellidos} ${usuario.nombres} autenticado exitosamente`,
        icono: 'success',
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        estado: false,
        message: `Error al autenticar usuario: ${error.message}`,
        icono: 'error',
      });
    }
  }

  @Get('obtenerUsuario')
  @UseGuards(JwtAuthGuard)
  async obtenerUsuario(@Req() req: any, @Res() res: Response) {
    try {
      // El 'id' del usuario lo obtienes desde el token, que está disponible en req.usuario
      const usuarioId = req.usuario.id;

      const g_usuario = await this.usuarioRepository.findOne({
        where: { id: usuarioId },
        relations: ['rol'],
      });

      if (!g_usuario) {
        return res.status(HttpStatus.NOT_FOUND).json({
          estado: false,
          message: `El usuario no existe`,
        });
      }

      const usuario = {
        id: g_usuario.id,
        nombres: g_usuario.nombres,
        apellidos: g_usuario.apellidos,
        email: g_usuario.email,
        nombreUsuario: g_usuario.nombreUsuario,
        ipUser: g_usuario.ipUser,
        rol: g_usuario.rol.nombre,
      };

      return res.status(HttpStatus.OK).json({
        estado: true,
        usuario,
      });

    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        estado: false,
        message: `Error al obtener usuario: ${error.message}`,
      });
    }
  }

  @Post('actualizarUsuario/:idUsuario')
  @UseGuards(JwtAuthGuard)
  async actualizarUsuario(
    @Param('idUsuario') idUsuario: number,
    @Body() datosUsuario: { nombres?: string, apellidos?: string, clave?: string, estado?: boolean },
    @Res() res: Response
  ) {
    try {
      const g_usuario = await this.usuarioRepository.findOne({
        where: { id: idUsuario },
      });

      if (!g_usuario) {
        return res.status(HttpStatus.NOT_FOUND).json({
          estado: false,
          message: `El usuario no existe`,
        });
      }

      // Solo actualizar los campos si se proporcionan en el body de la solicitud
      if (datosUsuario.nombres) {
        g_usuario.nombres = datosUsuario.nombres;
      }

      if (datosUsuario.apellidos) {
        g_usuario.apellidos = datosUsuario.apellidos;
      }

      if (datosUsuario.clave) {
        const hashedPassword = await bcrypt.hash(datosUsuario.clave, 10);
        g_usuario.clave = hashedPassword;
      }

      if (typeof datosUsuario.estado !== 'undefined') {
        g_usuario.estado = datosUsuario.estado;
      }

      const usuarioActualizado = await this.usuarioRepository.save(g_usuario);

      return res.status(HttpStatus.OK).json({
        estado: true,
        message: `Usuario ${usuarioActualizado.apellidos} ${usuarioActualizado.nombres} actualizado exitosamente`,
      });

    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        estado: false,
        message: `Error al actualizar usuario: ${error.message}`,
      });
    }
  }

  // @Post('registrarPerfil')
  // @UseGuards(JwtAuthGuard)
  // async registrarPerfil(
  //   @Body() datosUsuario: { perfil ?: file },
  //   @Req() req: any,
  //   @Res() res: Response
  // ) 
  // {
  //   try {
      
  //   } catch (error) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       estado: false,
  //       message: `Error al registrar el Perfil: ${error.message}`,
  //     });
  //   }
  // }
    

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('token');  // Limpiar la cookie que contiene el token
    return res.status(200).json({
      estado: true,
      message: 'Sesión cerrada correctamente',
      icono: 'success',
    });
  }
}

function generarIpUsuario() {
  // Generar un número aleatorio de 8 dígitos
  const ipUsuario = Math.floor(10000000 + Math.random() * 90000000); 
  return ipUsuario.toString(); // Devolverlo como string si prefieres
}