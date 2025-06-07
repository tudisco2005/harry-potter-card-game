<script>
    // Importa lo store della pagina per accedere ai dettagli dell'errore
    import { page } from '$app/stores';
</script>

<!-- 
    Componente di visualizzazione degli errori
    Mostra il codice di stato dell'errore e il messaggio di errore
    Utilizza stili Tailwind per la formattazione
-->
<div class="flex-grow text-center items-center justify-center">
    <!-- Codice di stato dell'errore (es. 404, 500) -->
    <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-700 dark:text-primary-600">{$page.status}</h1>
    <!-- Messaggio di errore generico -->
    <p class="text-3xl tracking-tight font-bold text-gray-900 dark:text-gray-400 md:text-4xl">C'è stato un errore imprevisto.</p>
    <!-- Messaggio di errore specifico -->
    <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">{$page.error.message}</p>
</div>