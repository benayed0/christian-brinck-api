import { Injectable } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { randomUUID } from 'crypto';

@Injectable()
export class DriveService {
  constructor(private s3Service: S3Service) {}
  getAll() {
    return this.s3Service.get_files();
  }
  async addOne(name: string, id?: string) {
    try {
      if (!id) {
        const ids = (await this.getAll()).map(({ id }) => id);
        let id = randomUUID();
        while (ids.includes(id)) {
          id = randomUUID();
        }
      }
      const preSignedUrl = await this.s3Service.getFileUploadUrl(id, name);
      return { id, preSignedUrl };
    } catch (error) {
      console.log(error);
    }
  }
  deleteOne(id: string) {
    return this.s3Service.deleteFile(id);
  }
  getOne(id: string) {
    return this.s3Service.getFile(id);
  }
}
