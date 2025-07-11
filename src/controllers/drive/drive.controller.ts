import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DriveService } from 'src/services/drive/drive.service';
import { S3Service } from 'src/services/s3/s3.service';

@Controller('drive')
export class DriveController {
  constructor(
    private driveService: DriveService,
    private s3service: S3Service,
  ) {}
  @Post('get_file_upload_url')
  async getFileUploadUrl(@Body('filename') filename: string) {
    const response = await this.driveService.addOne(filename);

    return response;
  }
  @Get('totalsize')
  async getBucketSize() {
    const size = await this.s3service.getBucketSize();
    return { size };
  }
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const { url } = await this.driveService.getOne(id);
    return { url };
  }
  @Get('')
  getAll() {
    return this.driveService.getAll();
  }
  @Delete(':id')
  deleteFile(@Param('id') id: string) {
    return this.driveService.deleteOne(id);
  }
}
