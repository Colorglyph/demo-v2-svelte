<script>
import { page } from "$app/stores";

import BigNumber from "bignumber.js";
import { onMount } from "svelte";

import { baseUrl, compressAccount, handleResponse } from "../../@js/utils";
import {
  userAccount,
  userAccountLoaded,
  userRefresh,
} from "../../@state/user";

const id = $page.params.id;

$: glyph = {}
$: userBuyOffers = [];
$: userSellOffers = [];
$: buyNowOffers = [];
$: sellNowOffers = [];

onMount(() => {
  userRefresh($userAccount);

  userAccountLoaded.subscribe((account) => {
    if (!account?.balances) return;

    fetch(`${baseUrl}/proxy/glyph?id=${id}`)
    .then(handleResponse)
    .then((res) => {
      glyph = res
      userBuyOffers = res.offers.buy.filter(({ seller }) => seller === $userAccount) 
      userSellOffers = res.offers.sell.filter(({ seller }) => seller === $userAccount) 
      buyNowOffers = res.offers.sell.filter(({ buying }) =>
        account.balances.find(
          ({ asset_issuer, balance }) =>
            asset_issuer === buying.asset_issuer &&
            new BigNumber(balance).isGreaterThan(0)
        )
      )
      sellNowOffers = res.offers.buy.filter(({ buying }) =>
        account.balances.find(
          ({ asset_issuer, balance }) =>
            asset_issuer === buying.asset_issuer &&
            new BigNumber(balance).isGreaterThan(0)
        )
      )
    })
  });
});
</script>

{#if glyph.image}
<div class="flex items-start">
  <button on:click={() => history.back()} class="underline">Go Back</button>
  <div class="ml-4 w-96 h-96 border border-gray-200">
    <img
      src="data:image/png;base64,{glyph.image}"
      class="w-full h-full rendering-pixelated"
    />
  </div>
  <div class="ml-4">
    <h1>{glyph.name}</h1>
    <p class="text-xs">{glyph.description}</p>
  </div>
</div>
{/if}

{#if buyNowOffers.length}
  <h1>Buy it now</h1>
  <ul>
    {#each buyNowOffers as offer (offer.id)}
      <li>
        <button
          type="button"
          class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
        >
          Buy for {
            offer.buying.asset_code === 'COLORGLYPH'
            ? ''
            : offer.cost * 1.6
          } {@html
            offer.buying.asset_type === 'native'
            ? 'XLM'
            : `<img src='https://api.kalepail.com/sep39/${offer.buying.asset_issuer}?network=testnet' class="ml-2 rendering-pixelated">`
          }
        </button>
      </li>
    {/each}
  </ul>
{/if}

{#if sellNowOffers.length}
  <h1>Sell it now</h1>
  <ul>
    {#each sellNowOffers as offer (offer.id)}
      <li>
        <button
          type="button"
          class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
        >
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
  </ul>
{/if}

{#if userBuyOffers.length}
  <h1>Your buy offers</h1>
  <ul>
    {#each userBuyOffers as offer (offer.id)}
      <li>
        <button
          type="button"
          class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
        >
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
{/if}

{#if userSellOffers.length}
  <h1>Your sell offers</h1>
  <ul>
    {#each userSellOffers as offer (offer.id)}
      <li>
        <button
          type="button"
          class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
        >
          Delete {@html
            offer.buying.asset_code === "COLORGLYPH" 
            && offer.selling.asset_code === 'COLORGLYPH'
            ? `<img src='https://api.kalepail.com/sep39/${offer.buying.asset_issuer}?network=testnet' class="mx-2 rendering-pixelated">`
            : `${offer.cost * 1} ${
                offer.buying.asset_type === 'native'
                ? 'XLM'
                : `${offer.buying.asset_code}:${compressAccount(offer.buying.asset_issuer)}`
              }`
          } sell offer
        </button>
      </li>
    {/each}
  </ul>
{/if}