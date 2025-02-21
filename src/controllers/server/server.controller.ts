import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ServerService } from '../../services/server/server.service';
import { UpdateVideoDto } from '../../dto/update-video.dto';
import { PostVideoScoresDto } from '../../dto/post-video-scores.dto';
import { AudioService } from 'src/services/audio/audio.service';

@Controller('')
// @UseGuards(ServerGuard)
export class ServerController {
  constructor(
    private readonly hcsService: ServerService,
    private videoService: AudioService,
  ) {}

  @Get('audios/:state')
  async get_video_to_process(@Param('state') state: string) {
    const result = await this.videoService.getAudiosToProcess(state);
    return result;
  }

  @Get('audio/:audio_id')
  async get_audio(@Param('audio_id') audio_id: string) {
    const result = await this.videoService.getAudioInfo(audio_id);
    return result;
  }

  @Get('download_video/:id')
  async get_video_url(@Param('id') id: string) {
    const result = await this.hcsService.get_video_url(id);
    throw new HttpException(
      result,
      result.error ? HttpStatus.NOT_FOUND : HttpStatus.OK,
    );
  }

  @Put('update')
  async update_video_state(@Body() updateVideoDto: UpdateVideoDto) {
    return await this.hcsService.update_audio_state(updateVideoDto);
  }
  @Get('get_scores_url/:id')
  async get_scores_url(@Param('id') id: string) {
    return await this.hcsService.getScoresUploadUrl(id);
  }
  @Put('add_hcs_scores/:id')
  async add_hcs_scores(
    @Param('id') id: string,
    @Body() postHcScoreDto: PostVideoScoresDto,
  ) {
    return await this.hcsService.add_hcs_scores(id, postHcScoreDto);
  }
  @Get('start')
  async start_instance() {
    return await this.hcsService.start_instance();
  }
  @Get('stop')
  async stop_instance() {
    return await this.hcsService.stop_instance();
  }
}
