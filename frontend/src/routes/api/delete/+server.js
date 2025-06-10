import { PUBLIC_API_SERVER_URL } from "$env/static/public";
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste DELETE per l'eliminazione dell'account utente
 * @param {Object} locals - Contiene i dati dell'utente locale
 * @param {Object} cookies - L'oggetto per gestire i cookie
 * @returns {Object} Risposta JSON con il risultato dell'operazione
 */
export async function DELETE({locals, cookies}) {
    try {
        // Recupera il token dall'oggetto locals
        const token = locals.user?.token;

        // Effettua la chiamata al backend per eliminare l'utente
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/delete`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
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
            return json({ message: data.message || response.statusText }, { status: response.status });
        }

        // Se l'eliminazione ha successo, elimina il cookie di autenticazione
        const { message } = data;
        cookies.delete('authToken', { path: '/' });
        return json({ message: message || 'Utente eliminato con successo' });
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante l\'eliminazione dell\'utente:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
};