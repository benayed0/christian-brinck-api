import { Body, Controller, Post } from '@nestjs/common';
import { AnonymizeService } from 'src/services/anonymize/anonymize.service';

@Controller('anonymize')
export class AnonymizeController {
  constructor(private anonymizeService: AnonymizeService) {}

  @Post('text')
  async anonymizeText(@Body('text') text: string) {
    return this.anonymizeService.anonymize(text);
  }
}
