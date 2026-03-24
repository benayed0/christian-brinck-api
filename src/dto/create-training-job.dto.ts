export class CreateTrainingJobDto {
  splitting_technique: '70/30' | 'worst/best';
  splitting_seed: number;
  model: string;
  output_model: string;
}
