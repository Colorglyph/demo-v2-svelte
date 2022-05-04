<script>
  import { onMount } from 'svelte'
  import BigNumber from 'bignumber.js'
  import { Keypair } from 'stellar-sdk'

  const FEE_PK = 'GBISA2O4573KH6MW5TEUTF3E4MCIZLNHHUN6Y73XXAK4EV45OVKMH352'

  $: userAccount = {}

  $: buyOffers = []
  $: sellOffers = []

  $: claimableBalances = []
  $: palettes = []

  $: ownedGlyphs = []
  $: availableGlyphs = []
  $: mintableGlyphs = []

  onMount(async () => {
    const userKeypair = Keypair.fromSecret(localStorage.getItem('secret'))
    const userPublicKey = userKeypair.publicKey()

    await Promise.all([
      fetch(`http://localhost:8787/proxy/account?id=${userPublicKey}`) // Your account
      .then(handleResponse)
      .then((res) => userAccount = res),

      fetch(`http://localhost:8787/proxy/offers?seller=${userPublicKey}`) // Your sell offers
      .then(handleResponse)
      .then((res) => sellOffers = res),

      fetch(`http://localhost:8787/proxy/claimable-balances?id=${userPublicKey}`) // Your buy offers (glyph for x) and glyph royalty payments
      .then(handleResponse)
      .then((res) => {
        res.forEach((record) => {
          if (record.claimants.find(({destination}) => destination === FEE_PK))
            claimableBalances.push(record)
          else
            buyOffers.push(record)
        })
      })

      // TODO: color royalty cbs for colorSponsorAccount
      // TODO: there can be instances thanks to remints that you can have open offers to buy your own glyphs
    ])

    claimableBalances = claimableBalances
    buyOffers = buyOffers

    fetch('http://localhost:8787/proxy/glyphs')
    .then(handleResponse)
    .then((res) => res.forEach((record) => {
      // Mintable
      if (!record.sponsor)
        mintableGlyphs = [...mintableGlyphs, record]

      // Available
      else if (
        !userAccount?.balances?.find((balance) => 
          record.id === balance.asset_issuer
          && new BigNumber(balance.balance).isGreaterThan(0)
        )
      ) {
        record = Object.assign(record, {
          baseOffers: [
            ...buyOffers.filter(({claimants}) => claimants.find(({destination}) => destination === record.id)),
            ...sellOffers.filter(({buying: {asset_issuer}}) => asset_issuer === record.id)
          ],
          counterOffers: []
        })

        fetch(`http://localhost:8787/proxy/offers?selling=${record.id}`) // Buy it now
        .then(handleResponse)
        .then((res) => {
          record.counterOffers.push(...res)
          availableGlyphs = availableGlyphs
        })

        availableGlyphs = [...availableGlyphs, record]
      }

      // Owned
      else {
        record = Object.assign(record, {
          baseOffers: sellOffers.filter(({selling: {asset_issuer}}) => asset_issuer === record.id),
          counterOffers: []
        })

        fetch(`http://localhost:8787/proxy/claimable-balances?id=${record.id}`) // Sell it now Glyph to X
        .then(handleResponse)
        .then((res) => {
          record.counterOffers.push(...res)
          ownedGlyphs = ownedGlyphs
        })

        fetch(`http://localhost:8787/proxy/offers?buying=${record.id}`) // Sell it now Glyph to Glyph
        .then(handleResponse)
        .then((res) => {
          record.counterOffers.push(...res)
          ownedGlyphs = ownedGlyphs
        })

        ownedGlyphs = [...ownedGlyphs, record]
      }
    }))

    fetch(`http://localhost:8787/proxy/palettes?id=${userPublicKey}`)
    .then(handleResponse)
    .then((res) => palettes = res)
  })

  function handleResponse(res) {
    if (res.ok)
      return res.json()
    throw res
  }

  function compressAccount(account) {
    return `${account.substring(0, 4)}...${account.slice(-4)}`
  }
</script>

<div class="mx-auto py-4 px-4 lg:max-w-7xl">
  {#if userAccount.id}
  <h1 class="text-2xl">User Account</h1>
  <p>{userAccount.id}</p>
  {/if}

  {#if ownedGlyphs.length}
  <h1 class="text-2xl mt-10">Owned Glyphs</h1>
  <div class="grid gap-x-2 gap-y-4 grid-cols-4">
  {#each ownedGlyphs as { counterOffers, baseOffers, id }}
    <div>
      <a href="/glyphs/{id}">
        <img src='https://api.kalepail.com/sep39/{id}?network=testnet' class="w-full border border-gray-100 rendering-pixelated">
      </a>

      {#if counterOffers.length}
      <ul>
      {#each counterOffers as offer}
        <li>
          <button type="button" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
            Sell for {
              offer.asset === 'COLORGLYPH' 
              ? `1 ${offer.asset.split(':')[0] +':'+ compressAccount(offer.asset.split(':')[1])}` 
              : offer.buying?.asset_code === 'COLORGLYPH'
              ? `1 ${offer.selling.asset_code +':'+ compressAccount(offer.selling.asset_issuer)}` 
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

      {#if baseOffers.length}
      <ul>
      {#each baseOffers as offer}
        <li>
          <button type="button" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
            Delete {
            offer.buying.asset_code === 'COLORGLYPH' 
            && offer.selling.asset_code === 'COLORGLYPH' 
            ? `1 COLORGLYPH:${compressAccount(offer.buying.asset_issuer)}`
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

      <ul>
        <li>
          <button type="button" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
            Scrape
          </button>
        </li>
        <li>
          <button type="button" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
            Sell
          </button>
        </li>
      </ul>
    </div>
  {/each}
  </div>
  {/if}

  {#if availableGlyphs.length}
  <h1 class="text-2xl mt-10">Available Glyphs</h1>
  <div class="grid gap-x-2 gap-y-4 grid-cols-4">
  {#each availableGlyphs as { counterOffers, baseOffers, id }}
    <div>
      <a href="/glyphs/{id}">
        <img src='https://api.kalepail.com/sep39/{id}?network=testnet' class="w-full border border-gray-100 rendering-pixelated">
      </a>

      {#if counterOffers.length}
      <ul>
      {#each counterOffers as offer}
        <li>
          <button type="button" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
            Buy for {`${
              offer.buying.asset_code === 'COLORGLYPH' 
              ? 1 
              : offer.price * offer.amount * 1.6
            } ${
              offer.buying.asset_type === 'native' 
              ? 'XLM' 
              : offer.buying.asset_code +':'+ compressAccount(offer.buying.asset_issuer)
            }`}
          </button>
        </li>
      {/each}
      </ul>
      {/if}

      {#if baseOffers.length}
      <ul>
      {#each baseOffers as offer}
        <li>
          <button type="button" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
            Delete {
            offer.claimants?.find((claimant) => claimant.destination !== userAccount.id)?.destination
            ? `${offer.amount * 1} ${
                offer.asset === 'native'
                ? 'XLM'
                : `${offer.selling.asset_code}:${compressAccount(offer.selling.asset_issuer)}`
              }`
            : `1 COLORGLYPH:${compressAccount(offer.buying.asset_issuer)}`
          } buy offer
          </button>
        </li>
      {/each}
      </ul>
      {/if}

      <ul>
        <li>
          <button type="button" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
            Buy
          </button>
        </li>
      </ul>
    </div>
  {/each}
  </div>
  {/if}

  {#if mintableGlyphs.length}
  <h1 class="text-2xl mt-10">Mintable Glyphs</h1>
  <div class="grid gap-x-2 gap-y-4 grid-cols-4">
  {#each mintableGlyphs as { id }}
    <div>
      <a href="/glyphs/{id}">
        <img src='https://api.kalepail.com/sep39/{id}?network=testnet' class="w-full border border-gray-100 rendering-pixelated">
      </a>
    </div>
  {/each}
  </div>
  {/if}

  {#if palettes.length}
  <div class="mt-10">
    <h1 class="text-2xl">Palettes</h1>
    {#each palettes as { id }}
    <div>
      {id}
    </div>
    {/each}
  </div>
  {/if}
</div>
