import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste POST per la vendita delle carte
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} request - L'oggetto richiesta contenente le carte da vendere
 * @returns {Object} Risposta JSON con il risultato dell'operazione
 */
export async function POST({ locals, request }) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;
        // Estrae le carte dal corpo della richiesta
        const { cards } = await request.json();

        // Effettua la chiamata al backend per vendere le carte
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/cards/sell`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({cards: cards})
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
            return json({ message: data.message || 'Errore durante la vendita' }, { status: response.status });
        }

        // Restituisce il risultato dell'operazione
        return json(data);
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante la vendita delle carte:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
};