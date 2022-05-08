import { groupBy } from 'lodash-es';
import { writable } from 'svelte/store'

import { baseUrl, handleResponse } from '../@js/utils'

export const userBuyOffers = writable([]);

export function userBuyOffersRefresh(id) {
  fetch(`${baseUrl}/proxy/claimable-balances?id=${id}`)
  .then(handleResponse)
  .then((res) =>
    userBuyOffers.set(
      Object.entries(
        groupBy(
          res,
          (({claimants}) =>
            claimants.find((claimant) => claimant.destination !== id).destination
          )
        )
      )
    )
  )
}