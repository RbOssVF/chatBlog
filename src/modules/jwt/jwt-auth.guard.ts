import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Verificar si existe el token en las cookies
    const token = request.cookies['token']; // Buscar el token en la cookie
    
    if (!token) {
      // Si no hay token, redirigir al login
      response.redirect('/');
      return false;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nestBlog2024.');
      request.usuario = decoded; // Adjuntar la información decodificada al request
      return true;
    } catch (err) {
      // Si el token es inválido, redirigir al login
      response.redirect('/');
      return false;
    }
  }
}