import nodemailer, { type Transporter } from 'nodemailer'
import { singleton } from 'tsyringe'
import type { AppConfig } from '@/config'
import type { IEmailService } from '@/shared/services'

@singleton()
export class NodeMailerService implements IEmailService {
  private transporter: Transporter
  private senderName: string
  private senderEmail: string

  constructor(config: AppConfig) {
    this.senderEmail = config.email.emailSenderEmail || 'no-reply@localhost'
    this.senderName = config.email.emailSenderName || 'no-reply@localhost'

    this.transporter = nodemailer.createTransport({
      host: config.email.emailHost || 'localhost',
      port: Number(config.email.emailPort || 587),
      secure: Number(config.email.emailPort) === 465,
      auth: {
        user: config.email.emailUser || 'no-reply@localhost',
        pass: config.email.emailPassword || 'no-reply@localhost',
      },
    })
  }

  public async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${this.senderName}" <${this.senderEmail}>`,
        to,
        subject,
        html: body,
      }
      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }
}
