<script>
import { page } from '$app/stores';
import BigNumber from 'bignumber.js';
import { uniqBy } from 'lodash-es';
import { onMount } from 'svelte'

import { baseUrl, handleResponse } from '../../@js/utils';
import { userAccount } from '../../@state/user';

const id = $page.params.id

$: account = {}
$: ownedGlyphs = []

onMount(() => {
  fetch(`${baseUrl}/proxy/account?id=${id}`)
  .then(handleResponse)
  .then((res) => {
    account = res
    res.balances
    .filter(({ asset_type, balance }) =>
      asset_type !== 'native'
      && new BigNumber(balance).isGreaterThan(0)
    )
    .forEach((balance) => {
      ownedGlyphs = uniqBy(
        [...ownedGlyphs, balance], 
        ({asset_code, asset_issuer}) => `${asset_code}:${asset_issuer}`
      )
    })

  })
})

// Add ability to scrape
</script>

<div class="py-4">
  {#if ownedGlyphs.length}
  <h1>Glyphs owned by {id === $userAccount ? 'you' : id}</h1>
  <p>{account.balances.find(({asset_type}) => asset_type === 'native').balance} XLM</p>
  <div class="grid gap-x-2 gap-y-2 grid-cols-6">
    {#each ownedGlyphs as { asset_code, asset_issuer } (`${asset_code}:${asset_issuer}`)}
      <div>
        <a class="flex flex-col p-2 border border-gray-100 rounded-lg" href="/glyphs/{asset_issuer}">
          <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="https://api.kalepail.com/sep39/{asset_issuer}?network=testnet">
          <!-- <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="data:image/png;base64,{image}"> -->
          <!-- <h1 class="mt-1">{name}</h1> -->
          <!-- <p class="text-xs">{description}</p> -->
        </a>
      </div>
    {/each}
  </div>
  {/if}
</div>