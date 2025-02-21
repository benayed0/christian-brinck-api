import { Test, TestingModule } from '@nestjs/testing';
import { ServerController } from './server.controller';
import { HcsService } from '../../services/hcs/hcs.service';

describe('HcsController', () => {
  let controller: ServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServerController],
      providers: [HcsService],
    }).compile();

    controller = module.get<ServerController>(ServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
