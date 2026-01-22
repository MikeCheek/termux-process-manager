import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 9010;
  const isProd = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: isProd ? process.env.HOST_IP : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(port, '0.0.0.0'); // Listen on all network interfaces
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();