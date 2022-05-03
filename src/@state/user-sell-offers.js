import { groupBy } from 'lodash-es'
import { writable } from 'svelte/store'

import { handleResponse } from '../@js/utils'

export const userSellOffers = writable([]);
export const userBuySellOffers = writable([]);

export function userSellOffersRefresh(seller) {
  userSellOffers.set([])
  userBuySellOffers.set([])

  fetch(`http://localhost:8787/proxy/offers?seller=${seller}`)
  .then(handleResponse)
  .then((res) => {
    userBuySellOffers.set(
      Object.entries(groupBy(res.filter(({buying, selling}) => 
        buying.asset_code === 'COLORGLYPH' 
        && selling.asset_code === 'COLORGLYPH' 
      ), 'buying.asset_issuer'))
    )

    userSellOffers.set(Object.entries(groupBy(res, 'selling.asset_issuer')))
  })
}