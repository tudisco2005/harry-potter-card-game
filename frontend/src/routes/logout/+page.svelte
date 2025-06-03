<script>
  import { goto, invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST'
      });

      if (response.ok) {
        await invalidateAll();
        // Wait a moment then redirect
        setTimeout(() => {
          goto('/');
        }, 2000);
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  });
</script>

<div class="flex-grow text-center items-center justify-center">
    <p class="text-3xl tracking-tight font-bold text-gray-900 dark:text-gray-400 md:text-4xl">
      Logout effettuato con successo
    </p>
    <p class="mt-4 text-gray-600 dark:text-gray-400">
      Verrai reindirizzato alla home page tra qualche secondo...
    </p>
</div>