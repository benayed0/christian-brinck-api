import { Injectable } from '@nestjs/common';
import { Client, SendEmailV3_1, LibraryResponse } from 'node-mailjet';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/schemas/users.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  client = new Client({
    apiKey: this.config.get('MAILJET_USER'),
    apiSecret: this.config.get('MAILJET_PASSWORD'),
  });
  sender = {
    Email: 'hellerikke@christian-brinck-phd.com',
    Name: 'AI-WWW support',
  };
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async send_email_to_confirm_from_admin(email: string, admins: Users[]) {
    const decoded_email = await this.jwtService.signAsync({ email });
    for (const admin of admins) {
      const emails_to_send = {
        Messages: [
          {
            From: this.sender,
            To: [
              {
                Email: admin.email,
              },
            ],
            TemplateErrorReporting: {
              Email: 'benayed.aziz.98@gmail.com',
              Name: 'AZIZ',
            },
            Variables: {
              email: email,
              url: `${this.config.get('AI_API_URL')}/cb/user/activate/${decoded_email}`,
            },
            TemplateID: 6704925,
            TemplateLanguage: true,
          },
        ],
      };
      try {
        const result: LibraryResponse<SendEmailV3_1.Response> =
          await this.client
            .post('send', { version: 'v3.1' })
            .request(emails_to_send);
        console.log(result);
      } catch (error) {
        return error;
      }
    }
    return true;
  }

  async send_email_to_confirm_registration(email: string) {
    let emails_to_send: SendEmailV3_1.Body = {
      Messages: [
        {
          From: this.sender,
          To: [
            {
              Email: email,
            },
          ],
          TemplateErrorReporting: {
            Email: 'benayed.aziz.98@gmail.com',
            Name: 'AZIZ',
          },
          Variables: { url: `${this.config.get('CLIENT_CB_URL')}/login` },
          TemplateID: 6704603,
          TemplateLanguage: true,
        },
      ],
    };

    const result: LibraryResponse<SendEmailV3_1.Response> = await this.client
      .post('send', { version: 'v3.1' })
      .request(emails_to_send);

    const { Status } = result.body.Messages[0];
    return Status;
  }
  async send_email_to_confirm_video_finished(
    email: string,
    video_name: string,
  ) {
    let emails_to_send: SendEmailV3_1.Body = {
      Messages: [
        {
          From: this.sender,
          To: [
            {
              Email: email,
            },
          ],
          TemplateErrorReporting: {
            Email: 'benayed.aziz.98@gmail.com',
            Name: 'AZIZ',
          },
          Variables: { video_name },
          TemplateID: 6704937,
          TemplateLanguage: true,
        },
      ],
    };

    const result: LibraryResponse<SendEmailV3_1.Response> = await this.client
      .post('send', { version: 'v3.1' })
      .request(emails_to_send);

    const { Status } = result.body.Messages[0];
    return Status;
  }
}
