import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste GET per ottenere le carte mancanti dell'utente
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @returns {Object} Risposta JSON con la lista delle carte mancanti
 */
export async function GET({ locals }) {
     try {
            // Recupera il token dall'oggetto locals
            const token = locals.user?.token;
    
            if (token) {
                // Effettua la chiamata al backend per ottenere le carte mancanti
                const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/cards/missing`, {
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
                    return json({ message: data.message || 'Errore durante il recupero delle carte mancanti' }, { status: response.status });
                }

                // Estrae i dati dalla risposta
                const { message, missingCards } = data;
                return json({ 
                    message: message || 'Operazione completata con successo', 
                    missingCards 
                });
            } else {
                // Se non c'è token, l'utente non è autenticato
                return json({ message: 'Token mancante' }, { status: 401 });
            }
    
        } catch (error) {
            // Gestione degli errori non previsti
            console.error('Errore durante il recupero delle carte mancanti:', error);
            return json({ message: 'Errore interno del server' }, { status: 500 });
        }
};