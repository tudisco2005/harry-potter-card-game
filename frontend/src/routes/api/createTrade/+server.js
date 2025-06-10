import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste POST per la creazione di uno scambio
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} request - L'oggetto richiesta contenente i dettagli dello scambio
 * @returns {Object} Risposta JSON con i dettagli dello scambio creato
 */
export async function POST({ locals, request }) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;
        // Estrae i dettagli dello scambio dal corpo della richiesta
        const { offeredCards, requestedCards, expireTime } = await request.json();

        if (token) {
            // Effettua la chiamata al backend per creare lo scambio
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/trade/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ offeredCards, requestedCards, expireTime })
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
                return json({ message: data.message || 'Errore durante la creazione dello scambio' }, { status: response.status });
            }

            // Estrae i dati dalla risposta
            const { message, trade } = data;
            return json({ 
                message: message || 'Scambio creato con successo', 
                trade 
            });
        } else {
            // Se non c'è token, l'utente non è autenticato
            return json({ message: 'Token mancante' }, { status: 401 });
        }
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante la creazione dello scambio:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}

