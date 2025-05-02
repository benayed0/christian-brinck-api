import { Test, TestingModule } from '@nestjs/testing';
import { AnonymizeController } from './anonymize.controller';

describe('AnonymizeController', () => {
  let controller: AnonymizeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnonymizeController],
    }).compile();

    controller = module.get<AnonymizeController>(AnonymizeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
