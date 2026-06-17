import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoggerService } from '../common/logger.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Get('captcha')
  getCaptcha() {
    return this.authService.getCaptcha();
  }

  @Post('login')
  login(@Body() body: any, @Req() req: any) {
    return this.authService.login(body, this.logger.getClientInfo(req));
  }

  @Post('register')
  register(@Body() body: any, @Req() req: any) {
    return this.authService.register(body, this.logger.getClientInfo(req));
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: any) {
    return this.authService.logout(req.user, this.logger.getClientInfo(req));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user);
  }

  @Post('check-password')
  checkPassword(@Body() body: any) {
    return this.authService.checkPassword(body);
  }
}
