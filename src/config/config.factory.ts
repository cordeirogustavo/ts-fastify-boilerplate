import type { IFactory } from '@/shared/interfaces'
import type { AppConfig, CacheProviderConfig } from './config.type'

export class ConfigFactory implements IFactory<AppConfig> {
  private loadedFromEnv = false

  private loadConfig(): void {
    if (!this.loadedFromEnv) {
      this.loadedFromEnv = true
    }
  }
  private appUrl = {
    local: 'http://localhost:5173',
    development: 'https://aimanagerdev.beeno.com.br',
    production: 'https://aimanager.beeno.com.br',
  }
  private env = (process.env.NODE_ENV as keyof typeof this.appUrl) || 'local'

  produce(): AppConfig {
    this.loadConfig()

    return {
      env: process.env.NODE_ENV || 'local',
      appName: process.env.APP_NAME || 'TS-API',
      appSlug: process.env.APP_SLUG || 'ts-api',
      appUrl: this.appUrl[this.env] || 'http://localhost:5173',
      cdnUrl: process.env.CDN_URL || '',
      appPort: Number(process.env.APP_PORT) || 3000,
      appSecret: process.env.APP_SECRET || 'your-secret-key',
      databaseUrl: `postgresql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}?sslmode=${process.env.DATABASE_IGNORE_SSL === 'true' ? 'disable' : 'require'}`,
      google: {
        oAuth: {
          clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
        },
        recaptcha: {
          secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY || '',
        },
      },
      email: {
        emailProvider: process.env.EMAIL_PROVIDER || 'nodemailer',
        emailService: process.env.EMAIL_SERVICE || '',
        emailHost: process.env.EMAIL_HOST || '',
        emailPort: Number(process.env.EMAIL_PORT) || 587,
        emailUser: process.env.EMAIL_USER || '',
        emailPassword: process.env.EMAIL_PASS || '',
        emailSenderName: process.env.EMAIL_SENDER_NAME || '',
        emailSenderEmail: process.env.EMAIL_SENDER_EMAIL || '',
      },
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || 'us-east-1',
        bucketName: process.env.AWS_BUCKET_NAME || '',
        bucketTest: process.env.AWS_BUCKET_TEST || '',
      },
      openAI: {
        apiKey: process.env.OPENAI_API_KEY || '',
      },
      otp: {
        globalEnabled: process.env.OTP_GLOBAL_ENABLED === '1' || false,
        issuer: process.env.OTP_ISSUER || '',
        emailTimeoutInMinutes: Number(process.env.OTP_TIMEOUT_IN_MINUTES) || 5,
      },
      cache: {
        provider: (process.env.CACHE_PROVIDER as CacheProviderConfig) || 'NodeCache',
        redis: {
          host: process.env.REDIS_HOST || '',
          port: Number(process.env.REDIS_PORT) || 6379,
          dbName: process.env.REDIS_DB_NAME || '',
          tls: process.env.REDIS_TLS === 'true' || false,
          username: process.env.REDIS_USERNAME || '',
          password: process.env.REDIS_PASSWORD || '',
        },
      },
      minAttemptsToBlockUserLogin: Number(process.env.MIN_ATTEMPTS_TO_BLOCK_USER_LOGIN) || 3,
    }
  }
}
