import type { AppConfig } from '@/config'

export const appConfig: AppConfig = {
  env: 'test',
  appName: 'test-app',
  appUrl: 'http://localhost',
  appSlug: 'test-slug',
  cdnUrl: 'https://cdn.example.com',
  appPort: 3000,
  appSecret: 'test-secret',
  databaseUrl: 'postgresql://postgres:postgres@localhost:5432/test-db',
  google: {
    oAuth: {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    },
    recaptcha: {
      secretKey: 'test-recaptcha-key',
    },
  },
  email: {
    emailProvider: 'nodemailer',
    emailService: 'test-service',
    emailHost: 'localhost',
    emailPort: 587,
    emailUser: 'test-email-user',
    emailPassword: 'test-email-password',
    emailSenderName: 'Test Sender',
    emailSenderEmail: 'test@example.com',
  },
  aws: {
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key',
    region: 'test-region',
    bucketName: 'test-bucket-name',
    bucketTest: 'test-bucket-test',
  },
  openAI: {
    apiKey: 'test-openai-key',
  },
  otp: {
    issuer: 'test-issuer',
    emailTimeoutInMinutes: 5,
    globalEnabled: true,
  },
  cache: {
    provider: 'NodeCache',
    redis: {
      host: 'localhost',
      port: 6379,
      dbName: 'test-db',
      tls: false,
      username: 'test-username',
      password: 'test-password',
    },
  },
  minAttemptsToBlockUserLogin: 3,
}
