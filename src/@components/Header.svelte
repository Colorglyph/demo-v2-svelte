<script>
import { userAccount } from '../@state/user'
</script>

<header class="flex items-center py-4">
  <a href="/">
    <h1 class="font-bold text-2xl">Colorglyph</h1>
  </a>

  <div class="ml-auto flex child:ml-4 hover:child:underline">
    <a class="child" href="/">Home</a>
    <a class="child" href="/trade">Trade</a>
    <a class="child" href="/create">Create</a>
    <a class="child" href="/profiles/{$userAccount}">Profile</a>
    <a class="child" href="/settings">Settings</a>
  </div>
</header>