import { Test, TestingModule } from '@nestjs/testing';
import { IpSetController } from './ip-set.controller';

describe('IpSetController', () => {
  let controller: IpSetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IpSetController],
    }).compile();

    controller = module.get<IpSetController>(IpSetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
