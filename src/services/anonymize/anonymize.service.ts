import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnonymizeService {
  constructor(
    private config: ConfigService,
    private http: HttpService,
  ) {}

  async anonymize(text: string): Promise<any> {
    const url = this.config.get('PYTHON_URL') + '/anonymize';

    try {
      const response = await firstValueFrom(this.http.post(url, { text }));
      //   console.log('Response from Python:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error from Python:', error);
      throw error;
    }
  }
}
