export class CreateEvaluationJobDto {
  splitting_technique: '70/30' | 'worst/best';
  splitting_seed: number;
  model: string;
  source_training_job_id?: string;
}
