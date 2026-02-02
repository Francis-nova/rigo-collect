import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@pkg/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { TemplatesService } from './templates/templates.service';

interface BaseMailPayload {
  to: string;
  subject: string;
  firstName?: string;
}

export interface VerificationMailPayload extends BaseMailPayload {
  otp: string;
  otpWindowMinutes?: number;
}

export interface PasswordChangedMailPayload extends BaseMailPayload {
  changedAt: string;
  ipAddress?: string;
  device?: string;
}

export interface PasswordResetInitPayload extends BaseMailPayload {
  otp: string;
  ttlSeconds: number;
}

export interface PasswordResetCompletePayload extends BaseMailPayload {
  changedAt: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService, private readonly templates: TemplatesService) {
    this.from = this.config.get<string>('MAIL_FROM') ?? 'no-reply@rigo-collect.com';

    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const secure = false;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    const transportOptions: SMTPTransport.Options = {
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined
    };

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async sendVerificationEmail(payload: VerificationMailPayload) {
    const otpWindowMinutes = payload.otpWindowMinutes ?? 10;
    await this.dispatch({
      to: payload.to,
      subject: payload.subject,
      template: 'verification',
      context: {
        subject: payload.subject,
        otp: payload.otp,
        firstName: payload.firstName,
        otpWindowMinutes,
        year: new Date().getFullYear()
      },
      text: `Your verification code is ${payload.otp}. It expires in ${otpWindowMinutes} minutes.`
    });
  }

  async sendPasswordChangedEmail(payload: PasswordChangedMailPayload) {
    const formattedChangedAt = this.formatDate(payload.changedAt);
    await this.dispatch({
      to: payload.to,
      subject: payload.subject,
      template: 'password-changed',
      context: {
        subject: payload.subject,
        firstName: payload.firstName,
        formattedChangedAt,
        ipAddress: payload.ipAddress,
        device: payload.device,
        year: new Date().getFullYear()
      },
      text: `Your password was changed on ${formattedChangedAt}.`
    });
  }

  async sendPasswordResetInitEmail(payload: PasswordResetInitPayload) {
    const ttlMinutes = Math.max(1, Math.round(payload.ttlSeconds / 60));
    await this.dispatch({
      to: payload.to,
      subject: payload.subject,
      template: 'password-reset-init',
      context: {
        subject: payload.subject,
        firstName: payload.firstName,
        otp: payload.otp,
        ttlMinutes,
        year: new Date().getFullYear()
      },
      text: `Use OTP ${payload.otp} to reset your password. It expires in ${ttlMinutes} minutes.`
    });
  }

  async sendPasswordResetCompletedEmail(payload: PasswordResetCompletePayload) {
    const formattedChangedAt = this.formatDate(payload.changedAt);
    await this.dispatch({
      to: payload.to,
      subject: payload.subject,
      template: 'password-reset-completed',
      context: {
        subject: payload.subject,
        firstName: payload.firstName,
        formattedChangedAt,
        year: new Date().getFullYear()
      },
      text: `Your password was reset on ${formattedChangedAt}.`
    });
  }

  private async dispatch(options: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
    text: string;
  }) {
    const html = await this.templates.render(options.template, options.context);

    await this.transporter.sendMail({
      to: options.to,
      from: this.from,
      subject: options.subject,
      html,
      text: options.text
    });

    this.logger.log(`Mail sent to ${options.to} for template ${options.template}`);
  }

  private formatDate(value: string | Date) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
