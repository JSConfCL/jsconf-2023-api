import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { LoggerInterceptorProvider } from './loggingContext.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { UsersModule } from './modules/users/users.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ServicesModule } from './services/services.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { Options } from 'pino-http';
import { AdminModule } from './admin/admin.module';
import pino from 'pino';
import * as newrelic from 'newrelic';
import { RedemptionModule } from './modules/redemption/redemption.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { UserTicketsController } from './modules/user_tickets/user_tickets.controller';

export const logger = pino({
  mixin() {
    return newrelic.getLinkingMetadata(true);
  },
  transport: {
    targets: [
      {
        target: './apm-transport',
        level: 'trace',
        options: {
          apiKey: process.env.NEW_RELIC_INGESTION_KEY,
        },
      },
      {
        target: 'pino-pretty',
        level: 'trace',
        options: {
          colorize: true,
          singleLine: true,
        },
      },
    ],
  },
});

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      resolvers: [AcceptLanguageResolver],
    }),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        logger,
      } as Options,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    SubscriptionsModule,
    AuthModule,
    PaymentsModule,
    ServicesModule,
    TicketsModule,
    WebhooksModule,
    AdminModule,
    RedemptionModule,
    PreferencesModule,
  ],
  controllers: [AppController, UserTicketsController],
  providers: [AppService, LoggerInterceptorProvider],
})
export class AppModule {}
