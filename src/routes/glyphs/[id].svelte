<script>
import { page } from "$app/stores";

import BigNumber from "bignumber.js";
import { uniqBy } from "lodash-es";
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

  userBuyOffers = [];
  userSellOffers = [];
  buyNowOffers = [];
  sellNowOffers = [];

  fetch(`https://api.kalepail.com/sep39/${id}?network=testnet&name=json`)
  .then(handleResponse)
  .then((res) => {
    glyph = { id }
    res.forEach(({key, value}) => glyph[key] = value)
    glyph = glyph
  })

  fetch(`${baseUrl}/proxy/offers?selling=${id}`)
    .then(handleResponse)
    .then((res) => {
      // Any buy it now offers (if you're not the seller)
      buyNowOffers = res.filter(({ seller }) => seller !== $userAccount);

      // Your sell offers (if you're the owner)
      userSellOffers = res.filter(({ seller }) => seller === $userAccount);
    });

  userAccountLoaded.subscribe((account) => {
    if (!account?.balances) return;

    fetch(`${baseUrl}/proxy/offers?buying=${id}`)
      .then(handleResponse)
      .then((res) => {
        // Your glyph<>glyph buy offers
        userBuyOffers.push(
          ...res.filter(({ seller }) => seller === $userAccount)
        );
        userBuyOffers = uniqBy(userBuyOffers, "id");

        // Any sell it now offers (If you're the owner)
        sellNowOffers.push(
          ...res.filter(({ buying }) =>
            account.balances.find(
              ({ asset_issuer, balance }) =>
                asset_issuer === buying.asset_issuer &&
                new BigNumber(balance).isGreaterThan(0)
            )
          )
        );
        sellNowOffers = uniqBy(sellNowOffers, "id");
      });

    fetch(`${baseUrl}/proxy/claimable-balances?id=${id}`)
      .then(handleResponse)
      .then((res) => {
        // Your glyph<>?? buy offers
        userBuyOffers.push(
          ...res.filter(({ claimants }) =>
            claimants.find(({ destination }) => destination === $userAccount)
          )
        );
        userBuyOffers = uniqBy(userBuyOffers, "id");

        // Any sell it now offers (If you're the owner)
        sellNowOffers.push(
          ...res.filter(({ claimants }) =>
            claimants.find(({ destination }) =>
              account.balances.find(
                ({ asset_issuer, balance }) =>
                  asset_issuer === destination &&
                  new BigNumber(balance).isGreaterThan(0)
              )
            )
          )
        );
        sellNowOffers = uniqBy(sellNowOffers, "id");
      });
  });
});
</script>

<div class="flex">
  <a href="/" on:click={() => history.go(-1)} class="underline">Go Back</a>
  <div class="ml-4 w-96 h-96 border border-gray-200">
    <img
      src="https://api.kalepail.com/sep39/{id}?network=testnet"
      class="w-full h-full rendering-pixelated"
    />
  </div>
  <div class="ml-4">
    <h1>{glyph.name}</h1>
    <p class="text-xs">{glyph.description}</p>
  </div>
</div>

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
            : offer.price * offer.amount * 1.6
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
            offer.asset === 'COLORGLYPH'
            ? `<img src='https://api.kalepail.com/sep39/${offer.asset.split(':')[1]}?network=testnet' class="ml-2 rendering-pixelated">`
            : offer.buying?.asset_code === 'COLORGLYPH'
            ? `<img src='https://api.kalepail.com/sep39/${offer.selling.asset_issuer}?network=testnet' class="ml-2 rendering-pixelated">`
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
            offer.claimants?.find((claimant) => claimant.destination !== userAccount.id)?.destination
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
{/if}
