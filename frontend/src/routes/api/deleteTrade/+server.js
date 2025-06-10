import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste DELETE per l'eliminazione di uno scambio
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} request - L'oggetto richiesta contenente l'ID dello scambio da eliminare
 * @returns {Object} Risposta JSON con il risultato dell'operazione e la lista aggiornata degli scambi
 */
export async function DELETE({ locals, request }) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;
        // Estrae l'ID dello scambio dal corpo della richiesta
        const { tradeId } = await request.json();

        //console.log('Trade accept request received for tradeId:', tradeId);

        if (token) {
            // Effettua la chiamata al backend per eliminare lo scambio
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/trade/delete`, {
                method: 'DELETE',
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

            const { message, trades } = data;

            // Se la risposta non è positiva, restituisce un errore
            if (!response.ok) {
                return json({ message: message || 'Errore durante l\'eliminazione dello scambio' }, { status: response.status });
            }

            return json({ 
                message: message || 'Scambio eliminato con successo', 
                trades 
            });
        } else {
            // Se non c'è token, l'utente non è autenticato
            return json({ message: 'Token mancante' }, { status: 401 });
        }
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante l\'eliminazione dello scambio:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}

