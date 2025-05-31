<script>
    import { page } from '$app/stores';
</script>

<div class="flex items-center justify-center ">
    <div class="py-8 px-4 my-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div class="mx-auto max-w-screen-sm text-center">
            <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-700 dark:text-primary-600">{$page.status}</h1> 
            <p class="text-3xl tracking-tight font-bold text-gray-900 dark:text-gray-400 md:text-4xl">C'è stato un errore imprevisto.</p>
            <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">{$page.error.message}</p> 
        </div>
    </div>
</div>