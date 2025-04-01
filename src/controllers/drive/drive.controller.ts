import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DriveService } from 'src/services/drive/drive.service';

@Controller('drive')
export class DriveController {
  constructor(private driveService: DriveService) {}
  @Post('get_file_upload_url')
  async getFileUploadUrl(@Body('filename') filename: string) {
    const response = await this.driveService.addOne(filename);

    return response;
  }
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const url = await this.driveService.getOne(id);
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
