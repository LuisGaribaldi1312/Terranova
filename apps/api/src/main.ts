import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('TERRANOVA_API');
  const app = await NestFactory.create(AppModule);

  // Prefijo global de API REST
  app.setGlobalPrefix('api/v1');

  // Habilitar CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validación de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    })
  );

  // Configuración de OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('TERRANOVA API — Intelligence & Territorial Management')
    .setDescription(
      'Documentación oficial de servicios geoespaciales, catastro municipal, infraestructura y sincronización offline para la República Mexicana (INEGI MGN / PostGIS).'
    )
    .setVersion('1.0.0-phase.3')
    .addTag('Organizaciones & Multi-Tenant')
    .addTag('Territorios & Marco Geoestadístico INEGI')
    .addTag('Catastro & Predios (TERRANOVA PROPERTIES)')
    .addTag('Incidencias Urbanas (TERRANOVA INCIDENTS)')
    .addTag('Infraestructura Urbana (TERRANOVA INFRASTRUCTURE)')
    .addTag('Obras & Proyectos (TERRANOVA PROJECTS)')
    .addTag('Sincronización Offline (TERRANOVA SYNC)')
    .addTag('Inteligencia Geoespacial & GIS (TERRANOVA GIS)')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`TERRANOVA Backend API iniciado exitosamente en puerto ${port}`);
  logger.log(`Documentación interactiva Swagger disponible en http://localhost:${port}/api/docs`);
}

bootstrap();
