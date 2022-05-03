export const isDev = typeof window === 'undefined' ? true : window.location.origin.indexOf('locahost') > -1
export const baseUrl = isDev ? 'http://localhost:8787' : 'https://colorglyph-v2-wrangler.tyler.workers.dev'

export function handleResponse(res) {
  if (res.ok)
    return res.json()
  throw res
}

export function compressAccount(account) {
  return `${account.substring(0, 4)}...${account.slice(-4)}`
}