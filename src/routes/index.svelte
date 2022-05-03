<script>
import { onMount } from 'svelte';

import { glyphs, glyphsRefresh } from '../@state/glyphs'
import { userAccount } from '../@state/user'

onMount(() => {
  glyphsRefresh($userAccount)
})
</script>

<div class="py-4">
  {#if $glyphs.length}
  <div class="grid gap-x-2 gap-y-2 grid-cols-6">
  {#each $glyphs as { id, image, name, description } (id)}
    <div>
      <a class="flex flex-col p-2 border border-gray-100 rounded-lg" href="/glyphs/{id}">
        <img class="w-full border border-gray-100 rendering-pixelated rounded-md" src="data:image/png;base64,{image}">
        <h1 class="mt-2">{name}</h1>
        <p class="text-xs">{description}</p>
      </a>
    </div>
  {/each}
  </div>
  {/if}
</div>