export async function load({ locals }) {
    // locals.user è popolato da hooks.server.js
    // fetch user data from the API

    return {
        user: locals.user // Questo oggetto user sarà disponibile in +layout.svelte
    };
}