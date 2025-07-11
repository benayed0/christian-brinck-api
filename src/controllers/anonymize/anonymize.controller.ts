import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnonymizeService } from 'src/services/anonymize/anonymize.service';
import { DriveService } from 'src/services/drive/drive.service';
import { S3Service } from 'src/services/s3/s3.service';

@Controller('anonymize')
export class AnonymizeController {
  constructor(
    private anonymizeService: AnonymizeService,
    private driverService: DriveService,
    private s3Service: S3Service,
  ) {}

  @Post('text')
  async anonymizeText(@Body('text') text: string) {
    return this.anonymizeService.anonymizeText(text);
  }

  @Get(':id')
  async anonymizeDoc(@Param('id') id: string) {
    const { fileName, url } = await this.driverService.getOne(id);
    const anonymized = await this.driverService.getOne(`anonymized-${id}`);
    if (!anonymized) {
      const { preSignedUrl } = await this.driverService.addOne(
        `anonymized-${fileName}`,
        `anonymized-${id}`,
      );
      const anonymizing = await this.anonymizeService.anonymizeDoc(
        id,
        url,
        preSignedUrl,
      );
      if (anonymizing.success) {
        const anonymizedUrl = await this.driverService.getOne(
          `anonymized-${id}`,
        );
        return { url: anonymizedUrl.url };
      }
    } else {
      return { url: anonymized.url };
    }
  }
}
