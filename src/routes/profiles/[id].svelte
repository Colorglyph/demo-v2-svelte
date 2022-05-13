<script>
import { page } from '$app/stores';
import { onMount } from 'svelte'

import { baseUrl, handleResponse } from '../../@js/utils';
import { userAccount } from '../../@state/user';

const id = $page.params.id

$: account = null
$: accountGlyphs = []

onMount(() => {
  fetch(`${baseUrl}/proxy/account?id=${id}`)
  .then(handleResponse)
  .then((res) => account = res)

  fetch(`${baseUrl}/proxy/account-glyphs?id=${id}`)
  .then(handleResponse)
  .then((res) => accountGlyphs = res)
})

// TODO add ability to scrape
</script>

<div class="py-4">
  <h1>Glyphs owned by {id === $userAccount ? 'you' : id}</h1>

  {#if account}
  <p>{account.balances.find(({asset_type}) => asset_type === 'native').balance} XLM</p>
  {/if}
  
  {#if accountGlyphs.length}
  <div class="grid gap-x-2 gap-y-2 grid-cols-6">
    {#each accountGlyphs as { asset_code, asset_issuer, image, name, description } (`${asset_code}:${asset_issuer}`)}
      <div>
        <a class="flex flex-col p-2 border border-gray-100 rounded-lg" href="/glyphs/{asset_issuer}">
          <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="data:image/png;base64,{image}">
          <h1 class="mt-1">{name}</h1>
          <p class="text-xs">{description}</p>
        </a>
      </div>
    {/each}
  </div>
  {/if}
</div>