<script>
import { onMount } from 'svelte'

import { userAccount } from '../@state/user'
import { baseUrl, compressAccount, handleResponse } from '../@js/utils';
import { groupBy } from 'lodash-es';

$: userGlyphs = []
$: userOffers = []

onMount(() => {
  fetch(`${baseUrl}/proxy/account-glyphs?id=${$userAccount}`)
  .then(handleResponse)
  .then((res) => userGlyphs = res)

  fetch(`${baseUrl}/proxy/account-offers?id=${$userAccount}`)
  .then(handleResponse)
  .then((res) => userOffers = Object.entries(groupBy(res.buy, 'buying.asset_issuer')))
})
</script>

<div class="py-4">
  {#if userGlyphs.length}
  <h1>Your glyphs</h1>
  <div class="grid gap-x-2 gap-y-2 grid-cols-6">
    {#each userGlyphs.filter(({offers}) => offers.buy.length || offers.sell.length) as { asset_code, asset_issuer, offers } (`${asset_code}:${asset_issuer}`)}
      <div>
        <a class="flex flex-col p-2 border border-gray-100 rounded-lg" href="/glyphs/{asset_issuer}">
          <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="https://api.kalepail.com/sep39/{asset_issuer}?network=testnet">

          <ul class="mt-2">
            {#each offers.buy as offer (offer.id)}
            <li>
              <button class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
                Sell for {@html 
                  offer.selling?.asset_code === 'COLORGLYPH'
                  ? `<img src='https://api.kalepail.com/sep39/${offer.selling.asset_issuer}?network=testnet' class="ml-2 rendering-pixelated">`
                  : `${offer.cost * 0.4} ${
                      offer.selling.asset_type === 'native'
                      ? 'XLM'
                      : `${offer.selling.asset_code}:${compressAccount(offer.selling.asset_issuer)}`
                    }`
                }
              </button>
            </li>
            {/each}

            {#each offers.sell as offer (offer.id)}
            <li>
              <button class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
                Delete {@html
                  offer.buying.asset_code === 'COLORGLYPH' 
                  && offer.selling.asset_code === 'COLORGLYPH'
                  ? `<img src='https://api.kalepail.com/sep39/${offer.buying.asset_issuer}?network=testnet' class="mx-2 rendering-pixelated">`
                  : `${offer.price * offer.amount} ${
                      offer.buying.asset_type === 'native'
                      ? 'XLM'
                      : `${offer.buying.asset_code}:${compressAccount(offer.buying.asset_issuer)}`
                    }`
                } sell offer
              </button>
            </li>
            {/each}
          </ul>
        </a>
      </div>
    {/each}
  </div>
  {/if}

  {#if userOffers.length}
  <h1>Your Buy Offers</h1>
  <div class="grid gap-x-2 gap-y-2 grid-cols-6">
    {#each userOffers as [key, offers] (key)}
      <div>
        <a class="flex flex-col p-2 border border-gray-100 rounded-lg" href="/glyphs/{key}">
          <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="https://api.kalepail.com/sep39/{key}?network=testnet">

          <ul class="mt-2">
            {#each offers as offer (offer.id)}
            <li>
              <button class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
                Delete {@html
                  offer.buying.asset_code === "COLORGLYPH" 
                  && offer.selling.asset_code === 'COLORGLYPH'
                  ? `<img src='https://api.kalepail.com/sep39/${offer.selling.asset_issuer}?network=testnet' class="mx-2 rendering-pixelated">`
                  : `${offer.cost * 1} ${
                      offer.selling.asset_type === 'native'
                      ? 'XLM'
                      : `${offer.selling.asset_code}:${compressAccount(offer.selling.asset_issuer)}`
                    }`
                } buy offer
              </button>
            </li>
            {/each}
          </ul>
        </a>
      </div>
    {/each}
  </div>
  {/if}
</div>