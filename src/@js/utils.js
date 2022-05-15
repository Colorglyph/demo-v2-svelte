import { dev, browser } from '$app/env';
import { Networks, Server } from 'stellar-sdk'

let baseUrl
let horizon
let network
let passphrase
let server

if (browser) {
  baseUrl = dev ? 'http://localhost:8787' : 'https://colorglyph-v2-wrangler.tyler.workers.dev'
  horizon = 'https://horizon-testnet.stellar.org'
  network = 'TESTNET'
  passphrase = Networks[network]
  server = new Server(horizon)
}

async function handleResponse(response) {
  const isResponseJson = response.headers.get('content-type')?.indexOf('json') > -1

  if (response.ok)
    return isResponseJson
    ? response.json() 
    : response.text()

  throw isResponseJson
  ? {
    ...await response.json(),
    status: response.status
  }
  : await response.text()
}

function compressAccount(account) {
  return `${account.substring(0, 4)}...${account.slice(-4)}`
}

export {
  baseUrl,
  horizon,
  network,
  passphrase,
  server,
  handleResponse,
  compressAccount
}