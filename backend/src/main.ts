import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  
  const config = new DocumentBuilder()
  .setTitle('Project Management API')
  .setDescription('API para gerenciamento de projetos')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
  origin: [
    'http://localhost:5173',
    'https://project-management-git-main-gustavolsantos-projects.vercel.app/',
  ],
});
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
