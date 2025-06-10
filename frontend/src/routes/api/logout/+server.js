import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste POST per il logout degli utenti
 * @param {Object} cookies - L'oggetto per gestire i cookie
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @returns {Object} Risposta JSON con il risultato dell'operazione
 */
export async function POST({ cookies, locals }) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;

        if (token) {
            // Effettua la chiamata al backend per il logout
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
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
                return json({ message: data.message || 'Errore durante il logout' }, { status: response.status });
            }

            // Elimina il cookie di autenticazione
            cookies.delete('authToken', { path: '/' });

            return json({ message: data.message || 'Logout effettuato con successo' });
        }

        // Se non c'è token, l'utente è già disconnesso
        return json({ message: 'Utente già disconnesso' });
        
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante il logout:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}
