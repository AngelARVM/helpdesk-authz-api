import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port: number = Number(process.env.PORT ?? 3000);

  // Configuring OPEN API
  const config = new DocumentBuilder()
    .setTitle('Auth - ABAC API')
    .setDescription(
      'This API that serves as an example of ABAC authz implementation',
    )
    .setVersion('1.0')
    .addTag('ABAC')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors();

  await app
    .listen(port)
    .then(() => console.log(`Server is running at http://localhost:${port}`));
}
bootstrap();
