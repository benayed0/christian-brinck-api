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

  async send_weighting_completed(
    email: string,
    job_type: string,
    splitting_technique: string,
    model: string,
    createdAt: Date,
    job_id: string,
  ) {
    const label = job_type === 'training' ? 'Training' : 'Evaluation';
    const dashboardUrl = `${this.config.get('CLIENT_CB_URL')}/weighting?job=${job_id}`;
    const html = this.buildEmailShell(
      `${label} job completed`,
      `
      <p style="font-size:28px;font-weight:700;color:#48c774;margin:0 0 12px;">&#10003; Job Completed</p>
      <p style="font-size:15px;color:#c0c0e0;margin:0 0 24px;line-height:1.6;">
        Your <strong style="color:#a0a0ff;">${label}</strong> job has finished successfully.
        Your output files are ready to download from your dashboard.
      </p>
      ${this.buildJobDetailsTable(job_type, splitting_technique, model, createdAt)}
      <table cellpadding="0" cellspacing="0" style="width:100%;margin-top:28px;">
        <tr><td align="center">
          <a href="${dashboardUrl}" style="display:inline-block;background-color:#4747b8;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
            View &amp; Download Results &rarr;
          </a>
        </td></tr>
      </table>
      `,
    );
    await this.sendRawEmail(email, `Your ${label} job is complete — AI-WWW`, html);
  }

  async send_weighting_failed(
    email: string,
    job_type: string,
    splitting_technique: string,
    model: string,
    createdAt: Date,
    error_message: string,
    job_id: string,
  ) {
    const label = job_type === 'training' ? 'Training' : 'Evaluation';
    const dashboardUrl = `${this.config.get('CLIENT_CB_URL')}/weighting?job=${job_id}`;
    const html = this.buildEmailShell(
      `${label} job failed`,
      `
      <p style="font-size:28px;font-weight:700;color:#ff6b6b;margin:0 0 12px;">&#10007; Job Failed</p>
      <p style="font-size:15px;color:#c0c0e0;margin:0 0 24px;line-height:1.6;">
        Unfortunately your <strong style="color:#a0a0ff;">${label}</strong> job encountered an error.
      </p>
      ${this.buildJobDetailsTable(job_type, splitting_technique, model, createdAt)}
      <table cellpadding="0" cellspacing="0" style="width:100%;margin-top:16px;background-color:#3a2020;border-radius:8px;border:1px solid rgba(255,107,107,0.25);">
        <tr>
          <td style="padding:14px 18px;">
            <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#aa6060;">Error</span><br>
            <span style="font-size:13px;color:#ffaaaa;font-family:monospace;word-break:break-word;">${this.escapeHtml(error_message)}</span>
          </td>
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" style="width:100%;margin-top:28px;">
        <tr><td align="center">
          <a href="${dashboardUrl}" style="display:inline-block;background-color:#4747b8;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
            View Job Details &rarr;
          </a>
        </td></tr>
      </table>
      `,
    );
    await this.sendRawEmail(email, `Your ${label} job failed — AI-WWW`, html);
  }

  private async sendRawEmail(to: string, subject: string, html: string) {
    const body: SendEmailV3_1.Body = {
      Messages: [
        {
          From: this.sender,
          To: [{ Email: to }],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    };
    try {
      await this.client.post('send', { version: 'v3.1' }).request(body);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  }

  private buildEmailShell(title: string, bodyContent: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${this.escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background-color:#f0f0f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f8;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#222245;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.18);">
        <tr>
          <td style="background-color:#1e1e3a;padding:20px 32px;border-bottom:1px solid rgba(71,71,184,0.3);">
            <span style="font-size:20px;font-weight:700;color:#e0e0ff;letter-spacing:0.5px;">AI&#8209;WWW</span>
            <span style="font-size:12px;color:#5555aa;margin-left:10px;">by christian-brinck-phd.com</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px 28px;">
            ${bodyContent}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid rgba(71,71,184,0.15);">
            <p style="font-size:11px;color:#44447a;margin:0;">You are receiving this because you submitted a job on AI&#8209;WWW. Do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private buildJobDetailsTable(job_type: string, splitting_technique: string, model: string, createdAt: Date): string {
    const label = job_type === 'training' ? 'Training' : 'Evaluation';
    const color = job_type === 'training' ? '#c8c0ff' : '#ffcc70';
    const bg = job_type === 'training' ? 'rgba(144,128,255,0.2)' : 'rgba(255,167,38,0.2)';
    const border = job_type === 'training' ? 'rgba(144,128,255,0.5)' : 'rgba(255,167,38,0.45)';
    const dateStr = createdAt ? new Date(createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
    return `
    <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#2a2a50;border-radius:8px;border:1px solid rgba(71,71,184,0.25);">
      <tr>
        <td style="padding:12px 18px;border-bottom:1px solid rgba(71,71,184,0.15);width:33%;">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.6px;color:#6060a0;">Type</span><br>
          <span style="display:inline-block;margin-top:4px;background:${bg};color:${color};border:1px solid ${border};border-radius:20px;font-size:11px;font-weight:700;padding:2px 10px;">${label}</span>
        </td>
        <td style="padding:12px 18px;border-bottom:1px solid rgba(71,71,184,0.15);width:33%;">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.6px;color:#6060a0;">Splitting</span><br>
          <span style="font-size:14px;color:#e0e0ff;font-weight:600;">${this.escapeHtml(splitting_technique)}</span>
        </td>
        <td style="padding:12px 18px;border-bottom:1px solid rgba(71,71,184,0.15);">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.6px;color:#6060a0;">Model</span><br>
          <span style="font-size:14px;color:#e0e0ff;font-weight:600;">${this.escapeHtml(model)}</span>
        </td>
      </tr>
      <tr>
        <td colspan="3" style="padding:12px 18px;">
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.6px;color:#6060a0;">Submitted</span><br>
          <span style="font-size:13px;color:#a0a0cc;">${dateStr}</span>
        </td>
      </tr>
    </table>`;
  }

  private escapeHtml(str: string): string {
    return (str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
