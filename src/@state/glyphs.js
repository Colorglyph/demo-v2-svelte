import { uniqBy } from 'lodash-es';
import { writable } from 'svelte/store'

import { baseUrl, handleResponse } from '../@js/utils'

export const glyphs = writable([]);

export function glyphsRefresh() {
  fetch(`${baseUrl}/proxy/glyphs`)
  .then(handleResponse)
  .then((res) => res.forEach(({id}) =>
    fetch(`https://api.kalepail.com/sep39/${id}?network=testnet&name=json`)
    .then(handleResponse)
    .then((res) => {
      const glyph = { id }

      res.forEach(({key, value}) => glyph[key] = value)

      glyphs.update((glyphs) => uniqBy([...glyphs, glyph], 'id'))
    })
  ))
}