import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import { WeightingJob, WeightingJobDocument } from 'src/schemas/weighting-job.schema';
import { S3Service } from 'src/services/s3/s3.service';
import { MailService } from 'src/services/mail/mail.service';
import { UserService } from 'src/services/user/user.service';
import { CreateTrainingJobDto } from 'src/dto/create-training-job.dto';
import { CreateEvaluationJobDto } from 'src/dto/create-evaluation-job.dto';
import { CompleteJobDto } from 'src/dto/complete-job.dto';
import { FailJobDto } from 'src/dto/fail-job.dto';

@Injectable()
export class WeightingService {
  constructor(
    @InjectModel(WeightingJob.name)
    private weightingJobModel: Model<WeightingJobDocument>,
    private s3Service: S3Service,
    private mailService: MailService,
    private userService: UserService,
    private http: HttpService,
    private config: ConfigService,
  ) {}

  async createTrainingJob(
    dto: CreateTrainingJobDto,
    authorId: string,
    questionnaireBuffer: Buffer,
  ): Promise<{ job_id: string }> {
    const job_id = randomUUID();
    const questionnaireKey = `weighting_files/${job_id}/inputs/questionnaire.json`;

    await this.s3Service.putWeightingFile(
      questionnaireKey,
      questionnaireBuffer,
      'application/json',
    );

    await this.weightingJobModel.create({
      job_id,
      job_type: 'training',
      author_id: new Types.ObjectId(authorId),
      state: 'pending',
      splitting_technique: dto.splitting_technique,
      splitting_seed: Number(dto.splitting_seed),
      model: dto.model,
      output_model: dto.output_model,
      s3_questionnaire_key: questionnaireKey,
    });

    this.dispatchWebhook(job_id);

    return { job_id };
  }

  async createEvaluationJob(
    dto: CreateEvaluationJobDto,
    authorId: string,
    questionnaireBuffer: Buffer,
    finalWeightBuffer?: Buffer,
  ): Promise<{ job_id: string }> {
    const job_id = randomUUID();
    const questionnaireKey = `weighting_files/${job_id}/inputs/questionnaire.json`;
    let finalWeightKey: string;

    await this.s3Service.putWeightingFile(
      questionnaireKey,
      questionnaireBuffer,
      'application/json',
    );

    if (dto.source_training_job_id) {
      const sourceJob = await this.weightingJobModel.findOne({
        job_id: dto.source_training_job_id,
        job_type: 'training',
        state: 'completed',
      });
      if (!sourceJob || !sourceJob.s3_output_final_weight_key) {
        throw new BadRequestException(
          'Source training job not found or not completed',
        );
      }
      finalWeightKey = sourceJob.s3_output_final_weight_key;
    } else if (finalWeightBuffer) {
      finalWeightKey = `weighting_files/${job_id}/inputs/final_weight.json`;
      await this.s3Service.putWeightingFile(
        finalWeightKey,
        finalWeightBuffer,
        'application/json',
      );
    } else {
      throw new BadRequestException(
        'Provide either source_training_job_id or a final_weight file',
      );
    }

    await this.weightingJobModel.create({
      job_id,
      job_type: 'evaluation',
      author_id: new Types.ObjectId(authorId),
      state: 'pending',
      splitting_technique: dto.splitting_technique,
      splitting_seed: Number(dto.splitting_seed),
      model: dto.model,
      source_training_job_id: dto.source_training_job_id || null,
      s3_questionnaire_key: questionnaireKey,
      s3_final_weight_key: finalWeightKey,
    });

    this.dispatchWebhook(job_id);

    return { job_id };
  }

  async getJobsByUser(authorId: string): Promise<WeightingJobDocument[]> {
    return this.weightingJobModel
      .find({ author_id: new Types.ObjectId(authorId) })
      .sort({ createdAt: -1 });
  }

  async getJobById(
    job_id: string,
    authorId: string,
  ): Promise<WeightingJobDocument> {
    const job = await this.weightingJobModel.findOne({
      job_id,
      author_id: new Types.ObjectId(authorId),
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async getInputUrls(
    job_id: string,
    authorId: string,
  ): Promise<Record<string, string>> {
    const job = await this.getJobById(job_id, authorId);
    const urls: Record<string, string> = {};

    if (job.s3_questionnaire_key) {
      urls['questionnaire.json'] = await this.s3Service.getWeightingPresignedDownload(
        job.s3_questionnaire_key,
        3600,
      );
    }
    if (job.s3_final_weight_key) {
      urls['final_weight.json'] = await this.s3Service.getWeightingPresignedDownload(
        job.s3_final_weight_key,
        3600,
      );
    }

    return urls;
  }

  async getOutputUrls(
    job_id: string,
    authorId: string,
  ): Promise<Record<string, string>> {
    const job = await this.getJobById(job_id, authorId);
    const urls: Record<string, string> = {};

    if (job.s3_output_final_weight_key) {
      urls['final_weight.json'] = await this.s3Service.getWeightingPresignedDownload(
        job.s3_output_final_weight_key,
        3600,
      );
    }
    if (job.s3_output_results_xlsx_key) {
      urls['training_individual_results.xlsx'] =
        await this.s3Service.getWeightingPresignedDownload(
          job.s3_output_results_xlsx_key,
          3600,
        );
    }
    if (job.s3_output_figures_pdf_key) {
      urls['figures_report.pdf'] = await this.s3Service.getWeightingPresignedDownload(
        job.s3_output_figures_pdf_key,
        3600,
      );
    }

    return urls;
  }

  async deleteJob(job_id: string, authorId: string): Promise<void> {
    const job = await this.getJobById(job_id, authorId);
    await this.s3Service.deleteWeightingJob(job_id);
    await this.weightingJobModel.deleteOne({ job_id });
  }

  // --- Worker endpoints ---

  async getJobDetailsForWorker(job_id: string): Promise<{
    job: WeightingJobDocument;
    input_urls: Record<string, string>;
  }> {
    const job = await this.weightingJobModel.findOne({ job_id });
    if (!job) throw new NotFoundException('Job not found');

    const input_urls: Record<string, string> = {};

    if (job.s3_questionnaire_key) {
      input_urls['questionnaire'] = await this.s3Service.getWeightingPresignedDownload(
        job.s3_questionnaire_key,
        7200,
      );
    }
    if (job.s3_final_weight_key) {
      input_urls['final_weight'] = await this.s3Service.getWeightingPresignedDownload(
        job.s3_final_weight_key,
        7200,
      );
    }

    await this.weightingJobModel.updateOne({ job_id }, { state: 'processing' });

    return { job, input_urls };
  }

  async getUploadUrlsForWorker(
    job_id: string,
  ): Promise<Record<string, string>> {
    const job = await this.weightingJobModel.findOne({ job_id });
    if (!job) throw new NotFoundException('Job not found');

    const urls: Record<string, string> = {};

    if (job.job_type === 'training') {
      const key = `weighting_files/${job_id}/outputs/final_weight.json`;
      urls['final_weight_key'] = key;
      urls['final_weight_url'] = await this.s3Service.getWeightingPresignedUpload(
        key,
        3600,
      );
    } else {
      const xlsxKey = `weighting_files/${job_id}/outputs/training_individual_results.xlsx`;
      const pdfKey = `weighting_files/${job_id}/outputs/figures_report.pdf`;
      urls['results_xlsx_key'] = xlsxKey;
      urls['results_xlsx_url'] = await this.s3Service.getWeightingPresignedUpload(
        xlsxKey,
        3600,
      );
      urls['figures_pdf_key'] = pdfKey;
      urls['figures_pdf_url'] = await this.s3Service.getWeightingPresignedUpload(
        pdfKey,
        3600,
      );
    }

    return urls;
  }

  async completeJob(job_id: string, dto: CompleteJobDto): Promise<void> {
    const job = await this.weightingJobModel.findOne({ job_id });
    if (!job) throw new NotFoundException('Job not found');

    const update: Partial<WeightingJob> = {
      state: 'completed',
      finishedAt: new Date(),
    };

    if (dto.output_keys.final_weight_key) {
      update.s3_output_final_weight_key = dto.output_keys.final_weight_key;
    }
    if (dto.output_keys.results_xlsx_key) {
      update.s3_output_results_xlsx_key = dto.output_keys.results_xlsx_key;
    }
    if (dto.output_keys.figures_pdf_key) {
      update.s3_output_figures_pdf_key = dto.output_keys.figures_pdf_key;
    }

    await this.weightingJobModel.updateOne({ job_id }, update);

    const user = await this.userService.findById(job.author_id.toString());
    if (user) {
      await this.mailService.send_weighting_completed(
        user.email,
        job.job_type,
        job.splitting_technique,
        job.model,
        job.createdAt,
        job_id,
      );
    }
  }

  async failJob(job_id: string, dto: FailJobDto): Promise<void> {
    const job = await this.weightingJobModel.findOne({ job_id });
    if (!job) throw new NotFoundException('Job not found');

    await this.weightingJobModel.updateOne(
      { job_id },
      { state: 'failed', error_message: dto.error_message, finishedAt: new Date() },
    );

    const user = await this.userService.findById(job.author_id.toString());
    if (user) {
      await this.mailService.send_weighting_failed(
        user.email,
        job.job_type,
        job.splitting_technique,
        job.model,
        job.createdAt,
        dto.error_message,
        job_id,
      );
    }
  }

  async retryJob(job_id: string, authorId: string): Promise<{ job_id: string }> {
    const job = await this.getJobById(job_id, authorId);

    await this.weightingJobModel.updateOne(
      { job_id },
      { state: 'pending', error_message: null, finishedAt: null },
    );

    this.dispatchWebhook(job_id);

    return { job_id };
  }

  private dispatchWebhook(job_id: string): void {
    const url = this.config.get<string>('PYTHON_URL') + '/weighting';
    firstValueFrom(this.http.post(url, { job_id })).catch((err) =>
      console.error('Webhook dispatch failed:', err?.message),
    );
  }
}
