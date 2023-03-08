import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AutorizationGuard } from './autorization.guard';

@Module({
  providers: [],
})
export class AuthorizationModule {}
