import { Test, TestingModule } from '@nestjs/testing';
import { IpSetService } from './ip-set.service';

describe('IpSetService', () => {
  let service: IpSetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IpSetService],
    }).compile();

    service = module.get<IpSetService>(IpSetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
