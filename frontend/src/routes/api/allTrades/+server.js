import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste GET per ottenere tutti gli scambi disponibili
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} request - L'oggetto richiesta
 * @returns {Object} Risposta JSON con la lista di tutti gli scambi
 */
export async function GET({ locals, request }) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;

        if (token) {
            // Effettua la chiamata al backend per ottenere tutti gli scambi
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/trade/all`, {
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
                // Prova a convertire la risposta in JSON
                data = await response.json();
            } catch (e) {
                return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
            }

            if (!response.ok) {
                return json({ message: data.message || 'Errore durante il recupero degli scambi' }, { status: response.status });
            }

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
        console.error('Errore durante il recupero degli scambi:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}

