import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ServerGuard } from 'src/guards/server/server.guard';
import { WeightingService } from 'src/services/weighting/weighting.service';
import { CompleteJobDto } from 'src/dto/complete-job.dto';
import { FailJobDto } from 'src/dto/fail-job.dto';

@Controller('weighting/worker')
@UseGuards(ServerGuard)
export class WeightingWorkerController {
  constructor(private readonly weightingService: WeightingService) {}

  @Get(':job_id/details')
  async getJobDetails(@Param('job_id') job_id: string) {
    return this.weightingService.getJobDetailsForWorker(job_id);
  }

  @Get(':job_id/upload-urls')
  async getUploadUrls(@Param('job_id') job_id: string) {
    return this.weightingService.getUploadUrlsForWorker(job_id);
  }

  @Put(':job_id/complete')
  async completeJob(
    @Param('job_id') job_id: string,
    @Body() dto: CompleteJobDto,
  ) {
    await this.weightingService.completeJob(job_id, dto);
    return { success: true };
  }

  @Put(':job_id/fail')
  async failJob(
    @Param('job_id') job_id: string,
    @Body() dto: FailJobDto,
  ) {
    await this.weightingService.failJob(job_id, dto);
    return { success: true };
  }
}
