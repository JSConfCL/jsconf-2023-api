import { Module } from '@nestjs/common';
import { preferencesProviders } from './preferences.providers';
import { PreferencesService } from './preferences.service';

@Module({
  controllers: [],
  providers: [PreferencesService, ...preferencesProviders],
})
export class PreferencesModule {}
