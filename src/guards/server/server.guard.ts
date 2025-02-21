import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ServerGuard implements CanActivate {
  constructor(private configService: ConfigService) {
    this.HCS_API_KEY = this.configService.get<string>('HCS_API_KEY');
  }
  HCS_API_KEY: string;
  GITHUB_SECRET: string;
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    if (headers && headers.authorization) {
      const token = headers.authorization.split(' ')[1];

      if (token === this.HCS_API_KEY) {
        return true;
      }
    }
    return false;
  }
}
