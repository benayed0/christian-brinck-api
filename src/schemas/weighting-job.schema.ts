import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WeightingJobDocument = HydratedDocument<WeightingJob>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class WeightingJob {
  @Prop({ required: true, unique: true })
  job_id: string;

  @Prop({ required: true, enum: ['training', 'evaluation'] })
  job_type: string;

  @Prop({ required: true })
  author_id: Types.ObjectId;

  @Prop({
    default: 'pending',
    enum: ['pending', 'processing', 'completed', 'failed'],
  })
  state: string;

  @Prop()
  error_message: string;

  // --- Shared inputs ---
  @Prop({ required: true, enum: ['70/30', 'worst/best'] })
  splitting_technique: string;

  @Prop({ required: true })
  splitting_seed: number;

  @Prop({ required: true })
  model: string;

  // --- Training-only ---
  @Prop()
  output_model: string;

  // --- Evaluation-only ---
  @Prop()
  source_training_job_id: string;

  // --- S3 keys — inputs ---
  @Prop()
  s3_questionnaire_key: string;

  @Prop()
  s3_final_weight_key: string;

  // --- S3 keys — outputs ---
  @Prop()
  s3_output_final_weight_key: string;

  @Prop()
  s3_output_results_xlsx_key: string;

  @Prop()
  s3_output_figures_pdf_key: string;

  @Prop()
  createdAt: Date;

  @Prop()
  finishedAt: Date;
}

export const WeightingJobSchema = SchemaFactory.createForClass(WeightingJob);
