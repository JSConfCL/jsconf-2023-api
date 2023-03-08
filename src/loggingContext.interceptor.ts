import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Injectable()
export class LoggerContextInterceptor implements NestInterceptor {
  constructor(
    @InjectPinoLogger(LoggerContextInterceptor.name)
    private readonly logger: PinoLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { user, headers } = context.switchToHttp().getRequest<Request>();
    const userId = user?.id;
    const traceId = headers['x-trace-id'];
    this.logger.assign({ interceptor: true });
    if (userId) {
      this.logger.assign({ userId });
    }
    if (traceId) {
      this.logger.assign({ traceId });
    }
    return next.handle().pipe(
      tap(() => {
        return this.logger.info('end-interceptor', { traceId, userId });
      }),
    );
  }
}

export const LoggerInterceptorProvider = {
  provide: APP_INTERCEPTOR,
  useClass: LoggerContextInterceptor,
};
