import { redirect } from '@sveltejs/kit';

// Funzione che gestisce il caricamento della pagina 
// Se si ha gia loggato allora reindirizza alla pagina dell album
export function load({ locals }) {
    if (locals.user?.isAuthenticated) {
        throw redirect(307, '/album');
    } 
}