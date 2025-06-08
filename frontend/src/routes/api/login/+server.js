// Esempio: src/routes/login/+server.js
import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    try {
        const { username, password } = await request.json();

        // Chiama il tuo backend Node.js per l'autenticazione
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
        }

        const { token, message } = data;

        if (!response.ok) {
            return json({ message: message || 'Errore durante il login' }, { status: response.status });
        }

        // Imposta il token in un cookie HTTP-only
        cookies.set('authToken', token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 2 // 2 ore
        });

        return json({ message: message || 'Login effettuato con successo' });
    } catch (error) {
        console.error('Errore durante il login:', error);
        return json({ message: 'Errore interno del server' }, { status: 500 });
    }
}