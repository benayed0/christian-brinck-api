import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from 'src/guards/auth/auth.guard';
import { DashboardService } from 'src/services/dashboard/dashboard.service';
import { ServerService } from 'src/services/server/server.service';
import { AudioService } from 'src/services/audio/audio.service';
import { ExcelService } from 'src/services/excel/excel.service';
import { DocxService } from 'src/services/docx/docx.service';
import { Response } from 'express';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(
    private dahsboardService: DashboardService,
    private audioService: AudioService,
    private serverService: ServerService,
    private excelservice: ExcelService,
    private docxService: DocxService,
  ) {}
  @Get('get_video_upload_url/:original_name/:model_name')
  async get_video_upload_url(
    @Param('original_name') original_name: string,
    @Param('model_name') model_name: string,
    @Request() req: { user: { id: string } },
  ) {
    return await this.serverService.get_audio_upload_url(
      original_name,
      model_name,
      req.user.id,
    );
  }
  @Get('trigger_process/:audio_id')
  async trigger_process(@Param('audio_id') audio_id: string) {
    return await this.serverService.trigger_process(audio_id);
  }
  @Get('rework_video/:audio_id/:model')
  async rework_video(
    @Param('audio_id') audio_id: string,
    @Param('model_name') model_name: string,
  ) {
    return await this.serverService.reworkVideo(audio_id, model_name);
  }
  @Get('scores')
  async findAll(@Request() req: { user: { id: string } }) {
    const data = await this.audioService.findAllByUser(req.user.id);

    return data;
  }
  @Post('scores/progress')
  async findAllInProgress(
    @Body() body: { audio_ids: string[] },
    @Request() req: { user: { id: string } },
  ) {
    return await this.dahsboardService.findAllByUserInProgress(
      req.user.id,
      body.audio_ids,
    );
  }
  @Get('scores/:audio_id')
  async findOne(@Param('audio_id') audio_id: string) {
    return await this.dahsboardService.findOne(audio_id);
  }
  @Get('audio_url/:audio_id')
  async GetAudioUrl(@Param('audio_id') audio_id: string) {
    return await this.audioService.getAudioUrl(audio_id);
  }
  @Get('result_url/:audio_id')
  async GetResultUrl(@Param('audio_id') audio_id: string) {
    return await this.audioService.getResultUrl(audio_id);
  }
  @Get('transcript_url/:audio_id')
  async GetTranscriptUrl(@Param('audio_id') audio_id: string) {
    return await this.audioService.getTranscriptUrl(audio_id);
  }
  @Get('transcript_docx/:audio_id')
  async GetTranscriptDocx(
    @Param('audio_id') audio_id: string,
    @Res() res: Response,
  ) {
    const { transcription, title } =
      await this.audioService.getTranscription(audio_id);
    const buffer = await this.docxService.createDoc(title, transcription);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=${title}.docx`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
  @Delete('scores/:audio')
  async deleteOne(@Param('audio') audio: string) {
    return await this.dahsboardService.deleteOne(audio);
  }

  @Get('download_scores/:id')
  async get_audio_scores(@Param('id') id: string) {
    const audio = await this.dahsboardService.findOne(id);
    if (!audio) {
      return 'Video not found';
    }

    // Produce the Excel workbook
    const workbook = this.excelservice.produce_excel_of_audios([audio]);
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer).toString('base64');
  }
  @Get('download_scores')
  async get_all_audio_scores() {
    const audio = await this.dahsboardService.findAll({ state: 'finished' });
    if (!audio) {
      return 'Video not found';
    }

    // Produce the Excel workbook
    const workbook = this.excelservice.produce_excel_of_audios(audio);

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer).toString('base64');
  }
}
