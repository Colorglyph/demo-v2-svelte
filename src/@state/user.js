import { browser } from '$app/env';
import { writable } from 'svelte/store'
import { handleResponse } from '../@js/utils'

export const userAccountLoaded = writable(null);
export const userAccount = writable(null);

if (browser) {
  const { Keypair } = StellarSdk

  const userSecret = localStorage.getItem('secret') 
  const userKeypair = Keypair.fromSecret(userSecret)

  userAccount.set(userKeypair.publicKey())
}

export function userRefresh(id) {
  fetch(`http://localhost:8787/proxy/account?id=${id}`)
  .then(handleResponse)
  .then((res) => userAccountLoaded.set(res))
}