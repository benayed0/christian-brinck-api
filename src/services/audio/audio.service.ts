import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Audio } from 'src/schemas/audio.schema';
import { UserService } from '../user/user.service';
import { Scores } from 'src/interfaces/scores';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class AudioService {
  constructor(
    @InjectModel(Audio.name) private AudioModel: Model<Audio>,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    private s3service: S3Service,
  ) {}

  async getAudiosToProcess(state: string) {
    const audios = await this.AudioModel.find({ state });

    return Promise.all(
      audios.map(async (audio) => {
        const download_audio_url = await this.s3service.get_audio(
          audio.audio_id,
        );

        // Ensure the audio is really uploaded before processing
        if (!download_audio_url) {
          return null; // Filter out audios that aren't actually uploaded
        }

        return {
          ...audio.toObject(),
          download_audio_url,
          upload_transcription_url:
            await this.s3service.get_upload_transcription_url(audio.audio_id),
          download_transcription_url: await this.s3service.get_transcription(
            audio.audio_id,
          ),
          upload_result_url: await this.s3service.get_upload_result_url(
            audio.audio_id,
          ),
        };
      }),
    ).then((results) => results.filter((audio) => audio !== null)); // Remove null values from the final array
  }
  async getAudioInfo(audio_id: string) {
    const audio = await this.AudioModel.findOne({ audio_id });

    const download_audio_url = await this.s3service.get_audio(audio.audio_id);

    // Ensure the audio is really uploaded before processing
    if (!download_audio_url) {
      return null; // Filter out audios that aren't actually uploaded
    }

    return {
      ...audio.toObject(),
      download_audio_url,
      upload_transcription_url:
        await this.s3service.get_upload_transcription_url(audio.audio_id),
      download_transcription_url: await this.s3service.get_transcription(
        audio.audio_id,
      ),
      upload_result_url: await this.s3service.get_upload_result_url(
        audio.audio_id,
      ),
    };
  }
  async getAudioUrl(audio_id: string) {
    const find_id = await this.AudioModel.findOne({ audio_id });
    if (find_id !== null) {
      const url = await this.s3service.get_audio(audio_id);
      return { url };
    } else {
      return { error: 'not found in db' };
    }
  }
  async getTranscriptUrl(audio_id: string) {
    const find_id = await this.AudioModel.findOne({ audio_id });
    if (find_id !== null) {
      const url = await this.s3service.get_transcription(audio_id);
      return { url };
    } else {
      return { error: 'not found in db' };
    }
  }
  async getTranscription(audio_id: string) {
    const find_id = await this.AudioModel.findOne({ audio_id });
    if (find_id !== null) {
      const url = await this.s3service.get_transcription(audio_id);
      const response = await fetch(url);
      const transcription = await response.json();
      return { transcription, title: find_id.original_name.split('.')[0] };
    } else {
      return { error: 'not found in db' };
    }
  }
  async getResultUrl(audio_id: string) {
    const find_id = await this.AudioModel.findOne({ audio_id });
    if (find_id !== null) {
      const url = await this.s3service.get_result(audio_id);
      return { url };
    } else {
      return { error: 'not found in db' };
    }
  }
  async findByUser(user_id: string) {
    const author_id = new Types.ObjectId(user_id);
    const video_list = await this.AudioModel.find(
      {
        author_id,
      },
      { scores: 0 },
    ).sort({ _id: -1 });

    return video_list;
  }
  async findOne(audio_id: string) {
    return this.AudioModel.findOne({ audio_id: audio_id });
  }
  async findAllByUser(user_id: string) {
    const author_id = new Types.ObjectId(user_id);
    const user = await this.userService.findById(user_id);
    const last_used_model = user.last_used_model;
    const audio_list = await this.AudioModel.find({
      ...(user.is_admin ? {} : { author_id }),
    }).sort({ _id: -1 });
    const audios = await Promise.all(
      audio_list.map(async (audio) => ({
        ...audio.toObject(),
        createdAt: audio._id.getTimestamp(),
        author_email: (
          await this.userService.findById(audio.author_id.toString())
        ).email,
        results: await this.s3service.get_result(audio.audio_id),
      })),
    );
    // const size = Buffer.byteLength(JSON.stringify(videos));
    // console.log(size / 1024 / 1024, 'mb');

    return { audios, last_used_model };
  }

  round(number: number) {
    return Math.round(number * 100) / 100 || 0;
  }
  getVariableScore = (scores: Scores, dimension: string, variable: string) => {
    const first = scores[dimension][variable]['1'];
    const third = scores[dimension][variable]['3'];
    const fifth = scores[dimension][variable]['5'];
    return this.round(
      (first.length * 5 + 3 * third.length + fifth.length) /
        (first.length + third.length + fifth.length),
    );
  };

  getDimensionScore = (scores: Scores, dimension: string) => {
    let score = 0;
    for (const variable in scores[dimension]) {
      const variable_score = this.getVariableScore(scores, dimension, variable);
      if (variable_score === 0) {
        score += 1;
      }
      score += variable_score;
    }
    return this.round(score);
  };
  getTotalCost = (scores: Scores) => {
    return this.round(
      this.Dimensions(scores)
        .map((t) => t.Score)
        .reduce((acc, value) => acc + value, 0),
    );
  };
  Dimensions = (scores: Scores) => [
    { Habit: 'H1', Score: this.getDimensionScore(scores, 'H1') },
    { Habit: 'H2', Score: this.getDimensionScore(scores, 'H2') },
    { Habit: 'H3', Score: this.getDimensionScore(scores, 'H3') },
    { Habit: 'H4', Score: this.getDimensionScore(scores, 'H4') },
  ];
  computeScore(scores: Scores) {
    const Dimensions = this.Dimensions(scores);
    Dimensions.push({ Habit: 'Total', Score: this.getTotalCost(scores) });
    return Dimensions;
  }
}
