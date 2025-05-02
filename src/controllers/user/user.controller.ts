import {
  Controller,
  Get,
  HttpCode,
  Request,
  HttpStatus,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { UserService } from 'src/services/user/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('all')
  async get_all_users(@Request() req: { user: { id: string } }) {
    const data = await this.userService.findAllUsers(req.user.id);

    return data;
  }
  @HttpCode(HttpStatus.OK)
  @Get('activate/:encoded_email')
  async activate(@Param('encoded_email') encoded_email: string) {
    return await this.userService.activate(encoded_email);
  }
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('is_admin')
  async is_admin(@Request() req: { user: { id: string } }) {
    if (req.user.id) {
      const { is_admin } = await this.userService.findById(req.user.id);

      return { is_admin };
    } else {
      return { is_admin: false };
    }
  }
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('email')
  async get_email(@Request() req: { user: { id: string } }) {
    const { email } = await this.userService.findById(req.user.id);

    return { email };
  }
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Put('email/:email')
  async update_email(
    @Request() req: { user: { id: string } },
    @Param('email') email: string,
  ) {
    try {
      await this.userService.findOneAndUpdate(req.user.id, { email });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Put('password/:password')
  async update_password(
    @Request() req: { user: { id: string } },
    @Param('password') decoded_password: string,
  ) {
    try {
      const password = await this.userService.hashPassword(decoded_password);
      await this.userService.findOneAndUpdate(req.user.id, { password });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}
