import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { CreateUsersDto } from '../../dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(@Body() signUpDto: CreateUsersDto) {
    if (signUpDto) {
      return await this.authService.signUp(signUpDto.email, signUpDto.password);
    } else {
      throw new UnauthorizedException('missing');
    }
  }
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: CreateUsersDto) {
    if (signInDto) {
      return await this.authService.signIn(signInDto.email, signInDto.password);
    } else {
      throw new UnauthorizedException('missing');
    }
  }
}
