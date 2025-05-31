<script>
    import { page } from '$app/stores';
</script>

<div class="flex-grow text-center items-center justify-center">
    <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-700 dark:text-primary-600">{$page.status}</h1>
    <p class="text-3xl tracking-tight font-bold text-gray-900 dark:text-gray-400 md:text-4xl">C'è stato un errore imprevisto.</p>
    <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">{$page.error.message}</p>
</div>