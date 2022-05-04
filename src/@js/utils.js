import { dev, browser } from '$app/env';
import { Server } from 'stellar-sdk'

let baseUrl
let horizon
let server

if (browser) {
  baseUrl = dev ? 'http://localhost:8787' : 'https://colorglyph-v2-wrangler.tyler.workers.dev'
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
  baseUrl,
  horizon,
  server,
  handleResponse,
  compressAccount
}