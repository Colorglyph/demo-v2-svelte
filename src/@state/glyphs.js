import { writable } from 'svelte/store'

import { baseUrl, handleResponse } from '../@js/utils'

export const glyphs = writable([]);

export function glyphsRefresh() {
  fetch(`${baseUrl}/proxy/glyphs`)
  .then(handleResponse)
  .then((res) => glyphs.set(res))
}