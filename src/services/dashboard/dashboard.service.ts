import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { Audio } from '../../schemas/audio.schema';
import { S3Service } from '../s3/s3.service';
@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Audio.name) private AudioModel: Model<Audio>,
    private userService: UserService,
    private s3Service: S3Service,
  ) {}

  async findAllByUserInProgress(user_id: string, audio_ids: string[]) {
    const author_id = new Types.ObjectId(user_id);
    const user = await this.userService.findById(user_id);

    const audio_list = await this.AudioModel.find({
      audio_id: { $in: audio_ids },
      ...(user.is_admin ? {} : { author_id }),
    }).sort({ _id: -1 });
    const audios = await Promise.all(
      audio_list.map(async (audio) => ({
        ...audio.toObject(),
        createdAt: audio._id.getTimestamp(),
        author_email: (
          await this.userService.findById(audio.author_id.toString())
        ).email,
      })),
    );
    return audios;
  }

  async findAll(filter: Audio | {} = {}) {
    const audio_list = await this.AudioModel.find(filter).sort({ _id: -1 });
    return audio_list.map((audio) => ({
      ...audio.toObject(),
      createdAt: audio._id.getTimestamp(),
    }));
  }
  async findOne(audio_id: string) {
    const audio = await this.AudioModel.findOne({ audio_id: audio_id });

    if (audio) {
      const final = {
        ...audio.toObject(),
        createdAt: audio._id.getTimestamp(),
      };
      return final;
    } else {
      return audio;
    }
  }
  async deleteOne(audio_id: string) {
    const audio = await this.AudioModel.findOne({ audio_id: audio_id });
    await this.s3Service.delete_audio(audio_id);
    if (audio) {
      const final = await audio.deleteOne();
      return final;
    } else {
      return audio;
    }
  }
}
