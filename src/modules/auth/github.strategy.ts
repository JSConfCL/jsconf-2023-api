import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PinoLogger } from 'nestjs-pino';
import { Profile, Strategy } from 'passport-github';
import { createUsername } from '../helpers';
import { UsersService } from '../users/users.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly logger: PinoLogger,
    private usersService: UsersService,
  ) {
    super({
      clientID: process.env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_OAUTH_CALLBACK_URL,
      scope: ['read:user'],
    });
    this.logger.setContext(GithubStrategy.name);
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    const { id, username } = profile;
    this.logger.assign({ githubId: id, githubUsername: username });
    this.logger.info('Finding user with github id');
    const user = await this.usersService.findByProviderId(id);
    if (!user) {
      this.logger.info('Could not find user, creating them.');
      return await this.usersService.create({
        username: profile.username || createUsername(),
        email: profile.emails?.[0].value || '',
        providerId: profile.id,
        provider: profile.provider,
        photo: profile.photos?.[0].value || 'about:blank',
        name: profile.displayName,
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
