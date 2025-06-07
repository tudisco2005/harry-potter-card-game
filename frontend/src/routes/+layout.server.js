/**
 * Funzione di caricamento del layout del server
 * Questa funzione viene eseguita su ogni richiesta del server
 * @param {Object} locals - Contiene i dati locali della richiesta, incluso l'utente autenticato
 * @returns {Object} - Restituisce i dati dell'utente che saranno disponibili nel layout
 */
export async function load({ locals }) {
    // locals.user è popolato da hooks.server.js durante l'autenticazione
    // I dati dell'utente vengono recuperati dall'API nel file hooks.server.js

    return {
        user: locals.user // Questo oggetto user sarà disponibile in +layout.svelte per l'intera applicazione
    };
}