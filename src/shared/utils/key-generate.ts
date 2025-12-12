import crypto from 'node:crypto'

export const getKey = async (str: string) => {
  return crypto
    .createHash('md5')
    .update(str + Date.now())
    .digest('hex')
}
