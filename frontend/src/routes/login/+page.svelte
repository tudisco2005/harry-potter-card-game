<script>
    // Importa le funzionalità di navigazione e invalidazione della cache
    import { goto, invalidateAll } from '$app/navigation';

    // Stato del form e gestione degli errori
    let username_email = "";  // Input per email o username dell'utente
    let password = "";        // Input per la password dell'utente
    let error = "";          // Messaggio di errore da mostrare all'utente
    let success = false;     // Stato di successo del login
    let isLoading = false;   // Stato di caricamento durante la richiesta al server

    // Gestisce l'invio del form di login
    async function handleSubmit(event) {
        event.preventDefault();
        
        // Previene invii multipli durante il caricamento
        if (isLoading) return;
        
        isLoading = true;
        error = "";
        
        try {
            // Richiesta di login all'API
            const response = await fetch(`/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username_email,
                    password
                })
            });

            if (response.ok) {
                // In caso di successo:
                // 1. Imposta lo stato di successo
                // 2. Aggiorna i dati dell'applicazione
                // 3. Reindirizza alla pagina dell'album
                success = true;
                await invalidateAll();  // Aggiorna i dati dell'applicazione

                setTimeout(() => {
                    goto('/album');
                }, 300);
            } else {
                // In caso di errore:
                // 1. Recupera il messaggio di errore dal server
                // 2. Imposta lo stato di successo a false
                const data = await response.json();
                error = data.message || "Errore durante l'accesso";
                success = false;
            }
        } catch (err) {
            // Gestione degli errori di rete
            error = "Errore di rete: " + err.message;
            success = false;
        } finally {
            // Resetta lo stato di caricamento in ogni caso
            isLoading = false;
        }
    }
</script>

<!-- Sezione principale del form di login -->
<section class="bg-gray-50 dark:bg-gray-900 w-10/12 sm:w-3/12">
    <!-- Contenitore del form con stile card -->
    <div class="w-full px-2 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:max-w-2xl xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <!-- Titolo della pagina -->
            <h1 class="text-xl font-bold tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Accedi al tuo account
            </h1>
            <!-- Form di login -->
            <form class="space-y-4 md:space-y-6" on:submit={handleSubmit}>
                <!-- Campo email/username -->
                <div class="md:col-span-2">
                    <label for="email/username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Indirizzo Email o Username</label>
                    <input type="email/username" name="email/username" id="email/username" bind:value={username_email} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com or username" required>
                </div>
                <!-- Campo password -->
                <div>
                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input type="password" name="password" id="password" bind:value={password} placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                </div>
                <!-- Pulsante di submit con stato dinamico -->
                <button type="submit" class="{"w-full text-white " + (success ? "bg-green-600 disabled dark:bg-green-600 dark:focus:ring-green-800" : "bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800") + " font-medium rounded-lg text-sm px-5 py-2.5 text-center "}">{success ? "Accesso avvenuto con successo" : "Accedi al tuo account"}</button>
                <!-- Visualizzazione messaggi di errore -->
                {#if error}
                    <p class="text-sm text-red-500">{error}</p>
                {/if}
            </form>
            <!-- Link alla pagina di registrazione -->
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                Non hai un Account? <a href="/register" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Registrati qui</a>
            </p>
        </div>
    </div>
</section>