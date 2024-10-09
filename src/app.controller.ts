import { Controller, Get, Render, UseGuards, Res, Req } from '@nestjs/common';
import { JwtAuthGuard } from './modules/jwt/jwt-auth.guard';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get('/')
  root(@Res() res: Response) {
    // Al acceder a la página de login, eliminar la cookie 'token'
    res.clearCookie('token');  // Limpiar la cookie del token
    return res.render('inicio/index.html', { titulo: 'Login' });
  }

  @Get('/inicio')
  @UseGuards(JwtAuthGuard)  // Proteger la ruta con el guard
  @Render('inicio/principio.html')  // Página de inicio
  inicio() {
    return { titulo: 'Inicio' };
  }

  @Get('/configuracion')
  @UseGuards(JwtAuthGuard)  // Proteger la ruta con el guard
  @Render('inicio/usuario/configuracion.html')  // Página de inicio
  configuracion() {
    return { titulo: 'Configuración'};
  }
}