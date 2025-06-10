import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste POST per l'aggiornamento del profilo utente
 * @param {Object} request - L'oggetto richiesta contenente i dati da aggiornare
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @returns {Object} Risposta JSON con il risultato dell'operazione
 */
export async function POST({ request, locals }) {
    // Estrae i dati dal corpo della richiesta
    const { username, favouriteWizard } = await request.json();

    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;

        if (token) {
            // Effettua la chiamata al backend per aggiornare il profilo
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    favouriteWizard
                })
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
                return json({ message: message || 'Errore durante l\'aggiornamento' }, { status: response.status });
            }

            return json({ message: message || 'Profilo aggiornato con successo' });
        } else {
            // Se non c'è token, l'utente non è autenticato
            return json({ message: 'Token mancante' }, { status: 401 });
        }
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante l\'aggiornamento:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}
