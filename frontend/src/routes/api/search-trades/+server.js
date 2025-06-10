import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste GET per la ricerca degli scambi
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} request - L'oggetto richiesta contenente i parametri di ricerca
 * @returns {Object} Risposta JSON con i risultati della ricerca
 */
export async function GET({ locals, request }) {
    try {
        // Estrae i parametri di ricerca dall'URL
        request.query = new URL(request.url).searchParams;
        const searchParams = request.query.toString();
        
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;

        // Effettua la chiamata al backend per la ricerca degli scambi
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/trade/search?${searchParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Se la risposta non è positiva, lancia un errore
        if (!response.ok) {
            throw new Error('Errore durante la ricerca degli scambi');
        }

        // Restituisce i risultati della ricerca
        const data = await response.json();
        return json(data);

    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante la ricerca degli scambi:', error);
        return json(
            { message: 'Errore durante la ricerca degli scambi' },
            { status: 500 }
        );
    }
} 