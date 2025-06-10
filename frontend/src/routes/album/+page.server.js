import { redirect } from '@sveltejs/kit';

// Funzione che gestisce il caricamento della pagina dell'album
// se non si ha fatto il login e quindi non è presente il token reindirizza a /login
export function load({ locals }) {
    if (!locals.user?.isAuthenticated) {
        throw redirect(307, '/login');
    }

    return {
        user: locals.user
    };
}