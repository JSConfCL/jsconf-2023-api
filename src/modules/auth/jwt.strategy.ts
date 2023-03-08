import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly logger: PinoLogger,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWTKEY,
    });
    this.logger.setContext(JwtStrategy.name);
  }

  async validate(payload: any) {
    // check if user in the token actually exist
    this.logger.assign({ userId: payload.id });
    this.logger.info(`Validating user`);
    const user = await this.userService.findOneById(payload.id);
    if (!user) {
      this.logger.info(`Could not find user`);
      throw new UnauthorizedException(
        'You are not authorized to perform the operation',
      );
    }
    this.logger.info(`Valid user found`);
    return user;
  }
}
