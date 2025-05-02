import { Test, TestingModule } from '@nestjs/testing';
import { AnonymizeService } from './anonymize.service';

describe('AnonymizeService', () => {
  let service: AnonymizeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnonymizeService],
    }).compile();

    service = module.get<AnonymizeService>(AnonymizeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
