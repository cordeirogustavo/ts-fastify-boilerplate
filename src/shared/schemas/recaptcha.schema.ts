import z from 'zod'

export const RecaptchaHeaderSchema = z.object({
  'g-recaptcha-response': z.string(),
})
