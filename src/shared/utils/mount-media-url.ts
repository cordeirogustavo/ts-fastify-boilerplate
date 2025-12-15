export const mountMediaUrl = (cdnUrl: string, url: string) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('https')) return url
  return `${cdnUrl}/${url}`
}
