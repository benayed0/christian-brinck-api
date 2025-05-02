import { Module } from '@nestjs/common';
import { ServerService } from './services/server/server.service';
import { ServerController } from './controllers/server/server.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Audio, AudioSchema } from './schemas/audio.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { Users, UsersSchema } from './schemas/users.schema';
import { UserService } from './services/user/user.service';
import { DashboardController } from './controllers/dashboard/dashboard.controller';
import { DashboardService } from './services/dashboard/dashboard.service';
import { MailService } from './services/mail/mail.service';
import { UserController } from './controllers/user/user.controller';
import { AudioService } from './services/audio/audio.service';
import { ExcelService } from './services/excel/excel.service';
import { IpSetService } from './services/ip-set/ip-set.service';
import { IpSetController } from './controllers/ip-set/ip-set.controller';
import { Ip, IpSchema } from './schemas/ip.schema';
import { DocxService } from './services/docx/docx.service';
import { DriveController } from './controllers/drive/drive.controller';
import { DriveService } from './services/drive/drive.service';
import { S3Service } from './services/s3/s3.service';
import { AnonymizeService } from './services/anonymize/anonymize.service';
import { HttpModule } from '@nestjs/axios';
import { AnonymizeController } from './controllers/anonymize/anonymize.controller';

@Module({
  controllers: [
    ServerController,
    AuthController,
    DashboardController,
    UserController,
    IpSetController,
    DriveController,
    AnonymizeController,
  ],
  providers: [
    ServerService,
    AuthService,
    UserService,
    DashboardService,
    MailService,
    AudioService,
    ExcelService,
    IpSetService,
    DocxService,
    DriveService,
    S3Service,
    AnonymizeService,
  ],
  exports: [UserService, AudioService],
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `${configService.get<string>('MONGODB_URL')}cb`,
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1w' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Audio.name, schema: AudioSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Ip.name, schema: IpSchema },
    ]),
  ],
})
export class AppModule {}
