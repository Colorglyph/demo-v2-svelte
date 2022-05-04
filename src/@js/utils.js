let isDev
let baseUrl
let horizon
let server

if (typeof window !== 'undefined') {
  const { Server } = window.StellarSdk

  isDev = typeof window === 'undefined' ? true : window.location.origin.indexOf('locahost') > -1
  baseUrl = isDev ? 'http://localhost:8787' : 'https://colorglyph-v2-wrangler.tyler.workers.dev'

  horizon = 'https://horizon-testnet.stellar.org'
  server = new Server(horizon)  
}

async function handleResponse(res) {
  if (res.ok)
    return res.json()
  throw await res.json()
}

function compressAccount(account) {
  return `${account.substring(0, 4)}...${account.slice(-4)}`
}

export {
  isDev,
  baseUrl,
  horizon,
  server,
  handleResponse,
  compressAccount
}