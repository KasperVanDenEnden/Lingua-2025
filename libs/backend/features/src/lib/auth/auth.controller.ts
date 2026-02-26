import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UseGuards,
  Request,
  Put,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto } from '@lingua/dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ICreateUser, Id } from '@lingua/api';
import { BodyObjectIdsPipe, StringObjectIdPipe } from '@lingua/features';

@Controller('auth')
export class AuthController {
  private TAG = 'AuthController';
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    Logger.log('login', this.TAG);
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: ICreateUser) {
    Logger.log('register', this.TAG);
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Param('id', StringObjectIdPipe) id: Id) {
    Logger.log('changePassword', this.TAG);
    
    return this.authService.changePassword(changePasswordDto, id);
  }
}
