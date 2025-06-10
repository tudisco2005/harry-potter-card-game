// Esempio: src/routes/login/+server.js
import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

/**
 * Gestisce le richieste POST per l'autenticazione degli utenti
 * @param {Object} request - L'oggetto richiesta contenente username e password
 * @param {Object} cookies - L'oggetto per gestire i cookie
 * @returns {Object} Risposta JSON con il risultato dell'operazione
 */
export async function POST({ request, cookies }) {
    try {
        // Estrae username e password dal corpo della richiesta
        const { username, password } = await request.json();

        // Effettua la chiamata al backend per l'autenticazione
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // Gestisce la risposta dal server
        let data;
        try {
            data = await response.json();
        } catch (e) {
            return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
        }

        const { token, message } = data;

        // Se la risposta non è positiva, restituisce un errore
        if (!response.ok) {
            return json({ message: message || 'Errore durante il login' }, { status: response.status });
        }

        // Se l'autenticazione ha successo, imposta il token in un cookie sicuro
        cookies.set('authToken', token, {
            path: '/',
            httpOnly: true, // Previene l'accesso al cookie da JavaScript
            sameSite: 'lax', // Protezione contro attacchi CSRF
            maxAge: 60 * 60 * 2 // Il token scade dopo 2 ore
        });

        return json({ message: message || 'Login effettuato con successo' });
    } catch (error) {
        // Gestione degli errori non previsti
        console.error('Errore durante il login:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}