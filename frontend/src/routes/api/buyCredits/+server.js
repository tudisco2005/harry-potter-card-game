import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste POST per l'acquisto di crediti
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} request - L'oggetto richiesta contenente l'importo da acquistare
 * @returns {Object} Risposta JSON con il nuovo saldo e il messaggio di conferma
 */
export async function POST({ locals, request }) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;
        // Estrae l'importo dal corpo della richiesta
        const { amount } = await request.json();

        if (token) {
            // Effettua la chiamata al backend per acquistare i crediti
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/credits/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
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
                return json({ message: data.message || 'Errore durante l\'acquisto dei crediti' }, { status: response.status });
            }

            // Estrae i dati dalla risposta
            const { message, newBalance } = data;
            return json({ 
                message: message || 'Acquisto effettuato con successo', 
                newBalance 
            });
        } else {
            // Se non c'è token, l'utente non è autenticato
            return json({ message: 'Token mancante' }, { status: 401 });
        }
        
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante l\'acquisto dei crediti:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}
