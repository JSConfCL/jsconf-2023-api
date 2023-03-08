import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DEVELOPMENT, TEST, PRODUCTION } from '../constants';

export const getCorsConfig = (): CorsOptions | undefined => {
  switch (process.env.APP_ENV) {
    case DEVELOPMENT:
      return {
        origin: true,
        credentials: true,
        maxAge: 86400,
        preflightContinue: false,
      };
    case TEST:
      return {
        origin: true,
        credentials: true,
        maxAge: 86400,
        preflightContinue: false,
      };
    case PRODUCTION:
      return {
        origin: true,
        credentials: true,
        maxAge: 86400,
        preflightContinue: false,
      };
    default:
      return {
        origin: true,
        credentials: true,
        maxAge: 86400,
        preflightContinue: false,
      };
  }
};
