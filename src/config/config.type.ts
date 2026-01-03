export type LogLevelConfig = 'trace' | 'debug' | 'info' | 'warn'
export type CacheProviderConfig = 'Redis' | 'NodeCache'
export type EnvConfig = 'local' | 'development' | 'production'

export interface AppConfig {
  env: string
  appName: string
  appSlug: string
  appUrl: string
  cdnUrl: string
  appPort: number
  appSecret: string
  databaseUrl: string
  google: {
    oAuth: {
      clientId: string
      clientSecret: string
    }
    recaptcha: {
      secretKey: string
    }
  }
  email: {
    emailProvider: string
    emailService: string
    emailHost: string
    emailPort: number
    emailUser: string
    emailPassword: string
    emailSenderName: string
    emailSenderEmail: string
  }
  aws: {
    accessKeyId: string
    secretAccessKey: string
    region: string
    bucketName: string
    bucketTest: string
  }
  openAI: {
    apiKey: string
  }
  otp: {
    globalEnabled: boolean
    issuer: string
    emailTimeoutInMinutes: number
  }
  cache: {
    provider: CacheProviderConfig
    redis: {
      host: string
      port: number
      dbName: string
      tls: boolean
      username: string
      password: string
    }
  }
  minAttemptsToBlockUserLogin: number
}
