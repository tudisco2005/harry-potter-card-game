/** @type {import('./$types').RequestHandler} */
import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste GET per la ricerca delle carte
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} request - L'oggetto richiesta contenente i parametri di ricerca
 * @returns {Object} Risposta JSON con i risultati della ricerca
 */
export async function GET({ locals, request }) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;

        // Estrae i parametri di ricerca dall'URL
        request.query = new URL(request.url).searchParams;
        const searchParams = request.query.toString();

        // Effettua la chiamata al backend per la ricerca delle carte
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/cards/search?${searchParams}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "Authorization": `Bearer ${token}`
            }
        });

        // Gestisce la risposta dal server
        let data;
        try {
            data = await response.json();
        } catch (e) {
            return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
        }

        // Se la risposta non è positiva, restituisce un errore
        if (!response.ok) {
            return json({ message: data.message || 'Errore durante la ricerca' }, { status: response.status });
        }

        // Restituisce i risultati della ricerca
        return json(data);
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante la ricerca delle carte:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
};