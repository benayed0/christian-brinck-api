import { ConfigService } from '@nestjs/config';
import { ServerGuard } from './server.guard';

describe('HcsGuard', () => {
  it('should be defined', () => {
    expect(new ServerGuard(new ConfigService())).toBeDefined();
  });
});
