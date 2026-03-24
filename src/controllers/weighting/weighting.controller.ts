import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { WeightingService } from 'src/services/weighting/weighting.service';
import { CreateTrainingJobDto } from 'src/dto/create-training-job.dto';
import { CreateEvaluationJobDto } from 'src/dto/create-evaluation-job.dto';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('weighting')
@UseGuards(AuthGuard)
export class WeightingController {
  constructor(private readonly weightingService: WeightingService) {}

  @Post('training/start')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'questionnaire', maxCount: 1 },
      { name: 'individual_training', maxCount: 1 },
    ]),
  )
  async startTraining(
    @Body() body: any,
    @UploadedFiles()
    files: {
      questionnaire?: UploadedFile[];
      individual_training?: UploadedFile[];
    },
    @Request() req: { user: { id: string } },
  ) {
    if (!files?.questionnaire?.[0]) {
      throw new BadRequestException('questionnaire file is required');
    }
    if (!files?.individual_training?.[0]) {
      throw new BadRequestException('individual_training file is required');
    }

    const dto: CreateTrainingJobDto = {
      splitting_technique: body.splitting_technique,
      splitting_seed: body.splitting_seed,
      model: body.model,
      output_model: body.output_model,
    };

    return this.weightingService.createTrainingJob(
      dto,
      req.user.id,
      files.questionnaire[0].buffer,
      files.individual_training[0].buffer,
    );
  }

  @Post('evaluation/start')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'questionnaire', maxCount: 1 },
      { name: 'final_weight', maxCount: 1 },
    ]),
  )
  async startEvaluation(
    @Body() body: any,
    @UploadedFiles()
    files: {
      questionnaire?: UploadedFile[];
      final_weight?: UploadedFile[];
    },
    @Request() req: { user: { id: string } },
  ) {
    if (!files?.questionnaire?.[0]) {
      throw new BadRequestException('questionnaire file is required');
    }

    const dto: CreateEvaluationJobDto = {
      splitting_technique: body.splitting_technique,
      splitting_seed: body.splitting_seed,
      model: body.model,
      source_training_job_id: body.source_training_job_id || undefined,
    };

    return this.weightingService.createEvaluationJob(
      dto,
      req.user.id,
      files.questionnaire[0].buffer,
      files.final_weight?.[0]?.buffer,
    );
  }

  @Get('jobs')
  async getJobs(@Request() req: { user: { id: string } }) {
    return this.weightingService.getJobsByUser(req.user.id);
  }

  @Get('jobs/:job_id')
  async getJob(
    @Param('job_id') job_id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.weightingService.getJobById(job_id, req.user.id);
  }

  @Get('jobs/:job_id/inputs')
  async getInputUrls(
    @Param('job_id') job_id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.weightingService.getInputUrls(job_id, req.user.id);
  }

  @Get('jobs/:job_id/outputs')
  async getOutputUrls(
    @Param('job_id') job_id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.weightingService.getOutputUrls(job_id, req.user.id);
  }

  @Delete('jobs/:job_id')
  async deleteJob(
    @Param('job_id') job_id: string,
    @Request() req: { user: { id: string } },
  ) {
    await this.weightingService.deleteJob(job_id, req.user.id);
    return { success: true };
  }
}
