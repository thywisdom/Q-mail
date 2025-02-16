import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Add global prefix for API routes
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.BACKEND_PORT || 3001);
  console.log(`Backend running on http://localhost:${process.env.BACKEND_PORT || 3001}`);
}
bootstrap(); 