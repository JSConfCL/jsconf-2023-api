// eslint-disable-next-line @typescript-eslint/no-unused-vars
import newrelic from 'newrelic';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getCorsConfig } from './core/cors';
import { ValidateInputPipe } from './core/pipes/validate.pipe';
import { NewrelicInterceptor } from './newrelic.interceptor';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import {
  i18nValidationErrorFactory,
  I18nValidationExceptionFilter,
} from 'nestjs-i18n';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useGlobalPipes(
    new ValidationPipe({ exceptionFactory: i18nValidationErrorFactory }),
  );
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );

  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.useLogger(app.get(Logger));
  app.enableCors(getCorsConfig());
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalInterceptors(new NewrelicInterceptor());
  app.setGlobalPrefix('api/v1');
  // handle all user input validation globally
  app.useGlobalPipes(new ValidateInputPipe());
  console.log('TOKENS', { ...process.env });

  const config = new DocumentBuilder()
    .setTitle('Tickets API')
    .setDescription('Documentation endpoints')
    .setVersion('1.0')
    .addTag('JSCONF-CL')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
