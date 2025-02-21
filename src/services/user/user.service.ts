import { Injectable } from '@nestjs/common';
import { Users } from '../../schemas/users.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUsersDto } from '../../dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AudioService } from '../audio/audio.service';

// This should be a real class/interface representing a user entity

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name) private UsersModel: Model<Users>,
    private videoService: AudioService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async activate(encoded_email: string) {
    try {
      const { email } = await this.jwtService.verifyAsync(encoded_email, {
        secret: this.configService.get('JWT_SECRET'),
      });
      const user = await this.UsersModel.findOne({ email });
      if (user.is_confirmed) {
        return 'already active';
      }
      await this.UsersModel.findOneAndUpdate({ email }, { is_confirmed: true });
      await this.mailService.send_email_to_confirm_registration(email);
      return 'activated';
    } catch (error) {
      return error;
    }
  }
  findBy_Id(id: Types.ObjectId) {
    return this.UsersModel.findOne(id);
  }
  async saveLastUsedModel(id: Types.ObjectId, last_used_model: string) {
    return await this.UsersModel.findOneAndUpdate(id, { last_used_model });
  }
  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
  async createOne(user: CreateUsersDto) {
    return this.UsersModel.create(user);
  }
  async findOne(email: string) {
    return this.UsersModel.findOne({ email });
  }
  async findOneAndUpdate(id: string, updateData: Partial<CreateUsersDto>) {
    const _id = new Types.ObjectId(id);
    return await this.UsersModel.findOneAndUpdate(_id, updateData);
  }
  async findById(id: string) {
    return this.UsersModel.findById(id);
  }
  async findAllUsers(id: string) {
    const { is_admin } = await this.UsersModel.findById(id);
    if (is_admin) {
      let users: any = await this.UsersModel.find();

      for (const i in users) {
        const user = users[i];
        const audios = await this.videoService.findByUser(user.id);

        users[i] = { ...users[i].toObject(), audios };
      }

      return users;
    } else {
      return [];
    }
  }
  async findAdmins() {
    return this.UsersModel.find({ is_admin: true });
  }
  async addAdmin(id: string) {
    const _id = new Types.ObjectId(id);
    return await this.UsersModel.findOneAndUpdate(_id, { is_admin: true });
  }
}
