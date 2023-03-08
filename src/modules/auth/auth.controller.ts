import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from './../users/users.service';
import { DoesUserExist } from '../../core/guards/doesUserExist.guard';
import { GithubOauthGuard } from './github.guard';
import { GoogleOauthGuard } from './google.guard';
import { Request, Response } from 'express';
import { UserLoginDTO } from './userLogin.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request) {
    return await this.authService.login(req.user as unknown as UserLoginDTO);
  }

  @UseGuards(DoesUserExist)
  @Post('signup')
  async signUp(@Body() user: any) {
    return await this.authService.create(user);
  }

  @Get('github')
  @UseGuards(GithubOauthGuard)
  async github(@Res() response: Response) {
    response.send();
  }

  @Get('github/callback')
  @UseGuards(GithubOauthGuard)
  async githubAuthCallback(@Req() req: Request) {
    const { dataValues } = req.user as unknown as {
      dataValues: UserLoginDTO;
      id: string;
    };
    return await this.authService.login(dataValues);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth(@Res() response: Response) {
    response.send();
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req: Request) {
    const { dataValues } = req.user as unknown as {
      dataValues: UserLoginDTO;
      id: string;
    };
    return await this.authService.login(dataValues);
  }
}
