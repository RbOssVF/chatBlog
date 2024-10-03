import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token) {
      throw new UnauthorizedException('No se proporcionó un token');
    }

    try {
      const bearerToken = token.split(' ')[1]; // Extraer el token después de "Bearer"
      const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET || 'nestBlog2024.');
      request.usuario = decoded; // Adjuntar la información decodificada al request
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}