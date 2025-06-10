import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste GET per ottenere tutti gli scambi dell'utente
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} request - L'oggetto richiesta
 * @returns {Object} Risposta JSON con la lista degli scambi dell'utente
 */
export async function GET({ locals, request }) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;

        if (token) {
            // Effettua la chiamata al backend per ottenere gli scambi dell'utente
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/my-trades`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
                return json({ message: data.message || 'Errore durante il recupero dei tuoi scambi' }, { status: response.status });
            }

            // Estrae i dati dalla risposta
            const { message, trades } = data;

            return json({ 
                message: message || 'Operazione completata con successo', 
                trades 
            });
        } else {
            // Se non c'è token, l'utente non è autenticato
            return json({ message: 'Token mancante' }, { status: 401 });
        }
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante il recupero dei tuoi scambi:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}

