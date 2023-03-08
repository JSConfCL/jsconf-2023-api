import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PinoLogger } from 'nestjs-pino';
import { Profile, Strategy } from 'passport-google-oauth20';
import { createUsername } from '../helpers';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly logger: PinoLogger,
    private usersService: UsersService,
  ) {
    super({
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
    this.logger.setContext(GoogleStrategy.name);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const { id, displayName, emails, photos } = profile;
    this.logger.assign({ googleId: id });
    this.logger.info('Finding user with google id');
    const user = await this.usersService.findByProviderId(id);

    if (!user) {
      this.logger.info('Could not find user, creating them.');
      return await this.usersService.create({
        username: createUsername(),
        email: emails?.[0].value || '',
        photo: photos?.[0].value || '',
        providerId: id,
        provider: 'google',
        name: displayName,
      });
    }
    this.logger.info('User found', {
      userId: user.id,
      username: user.username,
      providerId: user.providerId,
      provider: user.provider,
    });
    return user;
  }
}
