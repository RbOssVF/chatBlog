import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as nunjucks from 'nunjucks';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NotFoundExceptionFilter } from './404_not_found.controller';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Plantillas

  nunjucks.configure(join(__dirname, 'views'), {
    autoescape: true,
    express: app,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setBaseViewsDir(join(__dirname, 'views'));
  app.setViewEngine('html'); // Cambia a 'html'

  app.useGlobalFilters(new NotFoundExceptionFilter());

  app.use(cookieParser());

  // Eliminamos la configuración de CORS
  await app.listen(3000);
}
bootstrap();
