import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const token = request.cookies['token'];
    const refreshToken = request.cookies['refreshToken'];

    if (!token && !refreshToken) {
      response.redirect('/');
      return false;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nestBlog2024.');
      request.usuario = decoded;
      return true;
    } catch (err) {
      if (err.name === 'TokenExpiredError' && refreshToken) {
        try {
          const decodedRefresh: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshSecret');
          
          const userId = decodedRefresh?.id || decodedRefresh?.sub;
          if (!userId) {
            response.redirect('/');
            return false;
          }

          const newToken = jwt.sign(
            { id: userId },
            process.env.JWT_SECRET || 'nestBlog2024.',
            { expiresIn: '1h' }
          );

          response.cookie('token', newToken, { httpOnly: true });
          request.usuario = decodedRefresh;
          return true;
        } catch (err) {
          response.redirect('/');
          return false;
        }
      } else {
        response.redirect('/');
        return false;
      }
    }
  }
}