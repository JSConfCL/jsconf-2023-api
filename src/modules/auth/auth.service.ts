import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PinoLogger } from 'nestjs-pino';
import { UserCreationDTO } from '../users/user.dto';
import { UserLoginDTO } from './userLogin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async validateUser(username: string, pass: string) {
    // find if user exist with this email
    this.logger.assign({ username });
    this.logger.info('validateUser');
    const user = await this.userService.findOneByEmail(username);
    if (!user) {
      this.logger.info('counld not find user by username');
      return null;
    }

    if (!user.password) {
      throw new Error('No password defined for this user');
    }
    // find if user password match
    const match = await this.comparePassword(pass, user.password);
    if (!match) {
      this.logger.info('Password invalid');
      return null;
    }

    // tslint:disable-next-line: no-string-literal
    const { password, ...result } = user;
    this.logger.info('User validated');
    return result;
  }

  public async login(user: UserLoginDTO) {
    this.logger.info('Login in user', { user });
    const token = await this.generateToken({
      id: user.id,
      name: user.name || '',
      username: user.username,
      photo: user.photo,
    });
    return { user, token };
  }

  public async create(user: UserCreationDTO) {
    if (!user.password) {
      throw new Error('no password present in user-creation');
    }
    // hash the password
    const pass = await this.hashPassword(user.password);

    // create the user
    const { password, ...createdUser } = await this.userService.create({
      ...user,
      password: pass,
    });

    // generate token
    const token = await this.generateToken({
      id: createdUser.id,
      name: createdUser.name,
      username: createdUser.username,
      photo: createdUser.photo,
    });

    // return the user and the token
    return { user: createdUser, token };
  }

  private async generateToken(user: {
    id: string;
    name: string;
    username: string;
    photo: string;
  }) {
    this.logger.info('Generating token', { user });
    const token = await this.jwtService.signAsync(user);
    this.logger.info('Token generated', { user });
    return token;
  }

  private async hashPassword(password: string) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  private async comparePassword(enteredPassword: string, dbPassword: string) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    if (match) {
      this.logger.info('passwords match');
    } else {
      this.logger.info('passwords do not match');
    }

    return match;
  }
}
