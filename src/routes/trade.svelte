<script>
import { onMount } from 'svelte'
import BigNumber from 'bignumber.js'

import { userAccountLoaded, userAccount, userRefresh } from '../@state/user'
import { userSellOffers, userBuySellOffers, userSellOffersRefresh } from '../@state/user-sell-offers'
import { userBuyOffers, userBuyOffersRefresh } from '../@state/user-buy-offers'
import { baseUrl, compressAccount, handleResponse } from '../@js/utils';
import { uniqBy } from 'lodash-es';

$: ownedGlyphs = []
$: buyOffers = []

onMount(() => {
  userRefresh($userAccount)
  userSellOffersRefresh($userAccount)
  userBuyOffersRefresh($userAccount)

  userAccountLoaded.subscribe((account) => {
    if (!account?.balances)
      return

    account?.balances
    .filter(({ asset_type, balance }) =>
      asset_type !== 'native'
      && new BigNumber(balance).isGreaterThan(0)
    )
    .forEach((balance) => {
      const { asset_issuer } = balance

      balance = Object.assign(balance, {offers: []})

      fetch(`${baseUrl}/proxy/claimable-balances?id=${asset_issuer}`) // Sell it now Glyph to X
      .then(handleResponse)
      .then((res) => {
        balance.offers.push(...res)
        ownedGlyphs = ownedGlyphs
      })

      fetch(`${baseUrl}/proxy/offers?buying=${asset_issuer}`) // Sell it now Glyph to Glyph
      .then(handleResponse)
      .then((res) => {
        balance.offers.push(...res)
        ownedGlyphs = ownedGlyphs
      })

      ownedGlyphs = uniqBy(
        [...ownedGlyphs, balance], 
        ({asset_code, asset_issuer}) => `${asset_code}:${asset_issuer}`
      )
    })
  })

  userBuySellOffers.subscribe(processBuyOffers)
  userBuyOffers.subscribe(processBuyOffers)
})

function processBuyOffers(offers) {
  offers.forEach(([key, offers]) => {
    const index = buyOffers.findIndex(([k]) => key === k)

    if (index > -1) {
      buyOffers[index][1].push(...offers)
      buyOffers[index][1] = uniqBy(buyOffers[index][1], 'id')
    } else {
      buyOffers.push([key, offers])
      buyOffers[0][1] = uniqBy(buyOffers[0][1], 'id')
    }
  })

  buyOffers = uniqBy(buyOffers, ([key]) => key)
}
</script>

<div class="py-4">
  {#if ownedGlyphs.length}
  <h1>Sell your glyphs</h1>
  <div class="grid gap-x-2 gap-y-2 grid-cols-6">
    {#each ownedGlyphs.filter(({offers}) => offers.length) as { asset_code, asset_issuer, offers } (`${asset_code}:${asset_issuer}`)}
      <div>
        <a class="flex flex-col p-2 border border-gray-100 rounded-lg" href="/glyphs/{asset_issuer}">
          <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="https://api.kalepail.com/sep39/{asset_issuer}?network=testnet">
          <!-- <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="data:image/png;base64,{image}"> -->
          <!-- <h1 class="mt-1">{name}</h1> -->
          <!-- <p class="text-xs">{description}</p> -->

          {#if offers?.length}
          <ul class="mt-2">
            {#each offers as offer (offer.id)}
            <li>
              <button class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
                Sell for {@html
                  offer.asset === 'COLORGLYPH' 
                  ? `<img src='https://api.kalepail.com/sep39/${offer.asset.split(':')[1]}?network=testnet' class="mx-2 rendering-pixelated">`
                  : offer.buying?.asset_code === 'COLORGLYPH'
                  ? `<img src='https://api.kalepail.com/sep39/${offer.selling.asset_issuer}?network=testnet' class="mx-2 rendering-pixelated">`
                  : `${offer.amount * 0.4} ${
                      offer.asset === 'native' || offer.selling.asset_type === 'native' 
                      ? 'XLM'
                      : `${offer.selling.asset_code}:${compressAccount(offer.selling.asset_issuer)}`
                    }`
                }
              </button>
            </li>
            {/each}
          </ul>
          {/if}
        </a>
      </div>
    {/each}
  </div>
  {/if}

  {#if $userSellOffers.length}
  <h1>Your Sell Offers</h1>
  <div class="grid gap-x-2 gap-y-2 grid-cols-6">
    {#each $userSellOffers as [id, offers] (id)}
      <div>
        <a class="flex flex-col p-2 border border-gray-100 rounded-lg" href="/glyphs/{id}">
          <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="https://api.kalepail.com/sep39/{id}?network=testnet">
          <!-- <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="data:image/png;base64,{image}"> -->
          <!-- <h1 class="mt-1">{name}</h1> -->
          <!-- <p class="text-xs">{description}</p> -->

          <ul class="mt-2">
            {#each offers as offer (offer.id)}
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

  {#if buyOffers.length}
  <h1>Your Buy Offers</h1>
  <div class="grid gap-x-2 gap-y-2 grid-cols-6">
    {#each buyOffers as [id, offers] (id)}
      <div>
        <a class="flex flex-col p-2 border border-gray-100 rounded-lg" href="/glyphs/{id}">
          <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="https://api.kalepail.com/sep39/{id}?network=testnet">
          <!-- <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="data:image/png;base64,{image}"> -->
          <!-- <h1 class="mt-1">{name}</h1> -->
          <!-- <p class="text-xs">{description}</p> -->

          <ul class="mt-2">
            {#each offers as offer (offer.id)}
            <li>
              <button class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
                Delete {@html
                  offer.claimants
                  ? `${offer.amount * 1} ${
                      offer.asset === 'native'
                      ? 'XLM'
                      : `${offer.selling.asset_code}:${compressAccount(offer.selling.asset_issuer)}`
                    }`
                  : `<img src='https://api.kalepail.com/sep39/${offer.selling.asset_issuer}?network=testnet' class="mx-2 rendering-pixelated">`
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