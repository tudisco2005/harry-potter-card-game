import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste POST per l'apertura dei pacchetti di carte
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} request - L'oggetto richiesta contenente la quantità di pacchetti da aprire
 * @returns {Object} Risposta JSON con le nuove carte ottenute e i crediti rimanenti
 */
export async function POST({ locals, request }) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;
        // Estrae la quantità dal corpo della richiesta
        const { quantity } = await request.json();

        if (token) {
            // Effettua la chiamata al backend per aprire i pacchetti
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/cards/package/open`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity })
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
                return json({ message: data.message || 'Errore durante l\'apertura del pacchetto' }, { status: response.status });
            }

            // Estrae i dati dalla risposta
            const { newCards, remainingCredits, message } = data;
            return json({ 
                message: message || 'Pacchetto aperto con successo', 
                newCards, 
                remainingCredits 
            });
        } else {
            // Se non c'è token, l'utente non è autenticato
            return json({ message: 'Token mancante' }, { status: 401 });
        }
        
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante l\'apertura del pacchetto:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}
