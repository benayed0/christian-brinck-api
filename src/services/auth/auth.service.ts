import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string; is_admin: boolean } | { error: any }> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('email');
    }
    if (!(await bcrypt.compare(password, user?.password))) {
      throw new UnauthorizedException('password');
    }
    if (!user.is_confirmed) {
      throw new UnauthorizedException('not_confirmed');
    }
    const payload = { id: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
      is_admin: user.is_admin,
    };
  }
  async signUp(email: string, password: string): Promise<{ success: boolean }> {
    const user = await this.usersService.findOne(email);

    if (user) {
      throw new UnauthorizedException('found');
    }

    const hashed_password = await this.usersService.hashPassword(password);

    const create_user = await this.usersService.createOne({
      email: email,
      password: hashed_password,
    });
    if (!create_user) {
      throw new UnauthorizedException('error');
    }
    const admins = await this.usersService.findAdmins();
    await this.mailService.send_email_to_confirm_from_admin(email, admins);
    return { success: true };
  }
}
