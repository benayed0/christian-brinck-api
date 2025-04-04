import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { UpdateVideoDto } from 'src/dto/update-video.dto';
import { PostVideoScoresDto } from 'src/dto/post-video-scores.dto';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Audio } from '../../schemas/audio.schema';
import { Model, Types } from 'mongoose';
import { DashboardService } from '../dashboard/dashboard.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import {
  DescribeInstanceStatusCommand,
  EC2Client,
  StartInstancesCommand,
  StopInstancesCommand,
} from '@aws-sdk/client-ec2';
import { S3Service } from '../s3/s3.service';
@Injectable()
export class ServerService implements OnApplicationShutdown {
  constructor(
    @InjectModel(Audio.name) private VideoModel: Model<Audio>,
    private dashboardSerice: DashboardService,
    private userservice: UserService,
    private mailservice: MailService,
    private s3service: S3Service,
  ) {}
  server_id = 'i-0db27c0951291515c';
  ec2 = new EC2Client({ region: 'us-east-1' });
  private taskPromise: Promise<{
    success: boolean;
    state?: string;
    error?: string;
  }> | null = null;

  async generateUniqueId() {
    const audio_ids = (await this.dashboardSerice.findAll()).map(
      (hcs) => hcs.audio_id,
    ); //
    let uniqueId = randomUUID();
    while (audio_ids.includes(uniqueId)) {
      uniqueId = randomUUID();
    }
    return uniqueId;
  }
  async get_audio_upload_url(
    original_name: string,
    model_name: string,
    user_id: string,
  ) {
    const audio_id = await this.generateUniqueId();

    const { PreSignedUrl } =
      await this.s3service.get_upload_audio_url(audio_id);
    const author_id = new Types.ObjectId(user_id);
    this.taskPromise = this.start_instance();
    await this.VideoModel.create({
      audio_id,
      original_name,
      model_name,
      author_id,
    });
    return { PreSignedUrl, audio_id };
  }
  async reworkVideo(audio_id: string, model_name: string) {
    try {
      await this.VideoModel.findOneAndUpdate({ audio_id }, { model_name });
      this.trigger_process(audio_id);
    } catch (error) {}
  }
  async trigger_process(audio_id: string) {
    try {
      const audio = await this.dashboardSerice.findOne(audio_id);
      const author_id = audio.author_id;
      const { email } = await this.userservice.findBy_Id(author_id);
      await this.userservice.saveLastUsedModel(author_id, audio.model_name);
      if (audio) {
        // trigger process
        return { ...audio, ...{ author_email: email } };
      }
    } catch (error) {
      console.log(error);

      return error;
    }
  }
  getUniqueId() {
    return randomUUID();
  }
  async get_video_url(audio_id: string) {
    const find_id = await this.VideoModel.findOne({ audio_id });

    if (find_id === null) {
      return { error: 'not found in db' };
    } else {
      const url = await this.s3service.get_audio(audio_id);
      return { url };
    }
  }

  async update_audio_state(updateHcDto: UpdateVideoDto) {
    // update video state
    try {
      const { audio_id, state } = updateHcDto;
      if (state === 'finished') {
        const finishedAt = new Date();
        const scores = await this.s3service.get_scores(audio_id);
        const { author_id, original_name } = await this.VideoModel.findOne({
          audio_id,
        });
        const { email } = await this.userservice.findBy_Id(author_id);
        await this.mailservice.send_email_to_confirm_video_finished(
          email,
          original_name,
        );
        await this.VideoModel.updateOne({ audio_id }, { scores, finishedAt });
        await this.s3service.delete_scores(audio_id);
      }
      await this.VideoModel.updateOne({ audio_id }, { ...updateHcDto });
      return `This action updates #${audio_id}`;
    } catch (error) {
      return error;
    }
  }

  async getScoresUploadUrl(audio_id: string) {
    const { PreSignedUrl } =
      await this.s3service.get_upload_scores_url(audio_id);
    return { PreSignedUrl };
  }
  async add_hcs_scores(audio_id: string, hcs_score: PostVideoScoresDto) {
    try {
      await this.VideoModel.updateOne(
        { audio_id },
        { scores: hcs_score, state: 'finished', finishedAt: new Date() },
      );
      return `This action updates #${audio_id}`;
    } catch (error) {
      return error;
    }
  }
  get_instance_state = async () => {
    const command = new DescribeInstanceStatusCommand({
      InstanceIds: [this.server_id],
      IncludeAllInstances: true,
    });

    const data = await this.ec2.send(command);

    const state = data.InstanceStatuses![0].InstanceState?.Name;
    return { state };
  };
  async start_instance(): Promise<{
    success: boolean;
    state?: string;
    error?: string;
  }> {
    try {
      // Get the initial state
      let { state } = await this.get_instance_state();

      // If it's already running, we're done.
      if (state === 'running') {
        return { success: true, state };
      }

      // If the instance is in a transitional state (e.g., stopping, pending, etc.)
      // wait until it reaches a state that allows starting (either 'stopped' or 'running').
      while (state !== 'stopped') {
        console.log(
          `Waiting for instance to be ready for starting, current state: ${state}`,
        );
        await new Promise((r) => setTimeout(r, 10000));
        state = (await this.get_instance_state()).state;
        // If it becomes running while waiting, return immediately.
        if (state === 'running') {
          return { success: true, state };
        }
      }

      // If the instance is stopped, issue the start command.
      if (state === 'stopped') {
        console.log(
          `Instance is currently stopped. Proceeding to start the instance, current state: ${state}`,
        );
        const command = new StartInstancesCommand({
          InstanceIds: [this.server_id],
        });
        await this.ec2.send(command);
      }

      return { success: true, state: state };
    } catch (error) {
      console.error('Error in start_instance:', error);
      return { success: false, error: error?.message || String(error) };
    }
  }
  async stop_instance(): Promise<{
    success: boolean;
    state?: string;
    error?: any;
  }> {
    try {
      const { state } = await this.get_instance_state();

      if (state !== 'running') {
        return { success: false, state };
        // throw `instance state : (${state}) not ready for stopping.`;
      } else {
        try {
          const command = new StopInstancesCommand({
            InstanceIds: [this.server_id],
          });
          const data = await this.ec2.send(command);

          return { success: true };
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      if (error) return { success: false, error: error };
    }
  }
  async onApplicationShutdown(signal?: string) {
    console.log(signal);

    if (this.taskPromise) {
      console.log('still starting instance not complete');
      const r = await this.taskPromise;
      console.log('starting instance completed', r);
    }
  }
}
