import { browser } from '$app/env';
import { writable } from 'svelte/store'
import { server, handleResponse } from '../@js/utils'

export const userAccountLoaded = writable(null);
export const userAccount = writable(null);

if (browser) {
  const { Keypair } = StellarSdk

  const userSecret = localStorage.getItem('secret') || (() => {
    const secret = Keypair.random().secret()
    localStorage.setItem('secret', secret)
    return secret
  })()
  const userKeypair = Keypair.fromSecret(userSecret)

  userAccount.set(userKeypair.publicKey())
}

export function userRefresh(id) {
  fetch(`http://localhost:8787/proxy/account?id=${id}`)
  .then(handleResponse)
  .then((res) => userAccountLoaded.set(res))
  .catch((err) => {
    console.log(err.status)

    if (err.status === 404)
      return server
      .friendbot(id)
      .call()
      .then(() => userRefresh(id))
  })
}