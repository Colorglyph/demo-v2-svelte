import { browser } from '$app/env'
import { writable } from 'svelte/store'

import { handleResponse } from '../@js/utils'

export const glyphs = writable([]);

export function glyphsRefresh() {
  glyphs.set([])
  
  fetch('http://localhost:8787/proxy/glyphs')
  .then(handleResponse)
  .then((res) => res.forEach(({id}) =>
    fetch(`https://api.kalepail.com/sep39/${id}?network=testnet&name=json`)
    .then(handleResponse)
    .then((res) => {
      const glyph = { id }

      res.forEach(({key, value}) => glyph[key] = value)

      glyphs.update((glyphs) => [...glyphs, glyph])
    })
  ))
}