import { APP_GUARD } from '@nestjs/core';
import { AutorizationGuard } from './autorization.guard';

export const authorizationProviders = [
  {
    provide: APP_GUARD,
    useClass: AutorizationGuard,
  },
];
