import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste POST per l'accettazione di uno scambio
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} request - L'oggetto richiesta contenente l'ID dello scambio da accettare
 * @returns {Object} Risposta JSON con il risultato dell'operazione
 */
export async function POST({ locals, request }) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;
        // Estrae l'ID dello scambio dal corpo della richiesta
        const { tradeId } = await request.json();

        //console.log('Trade accept request received for tradeId:', tradeId);

        if (token) {
            // Effettua la chiamata al backend per accettare lo scambio
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/trade/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tradeId })
            });

            // Gestisce la risposta dal server
            let data;
            try {
                data = await response.json();
            } catch (e) {
                return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
            }

            const { message } = data;

            // Se la risposta non è positiva, restituisce un errore
            if (!response.ok) {
                return json({ message: message || 'Errore durante l\'accettazione dello scambio' }, { status: response.status });
            }

            return json({ message: message || 'Scambio accettato con successo' });
        } else {
            // Se non c'è token, l'utente non è autenticato
            return json({ message: 'Token mancante' }, { status: 401 });
        }
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante l\'accettazione dello scambio:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}