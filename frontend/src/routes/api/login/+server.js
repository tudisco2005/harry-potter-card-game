// Esempio: src/routes/login/+server.js
import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';


export async function POST({ request, cookies }) {
    const { username, password } = await request.json();

    // Chiama il tuo backend Node.js per l'autenticazione
    const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        return json({ message: response.statusText }, { status: response.status });
    }

    const { token, message } = await response.json(); // Assumendo che il backend Node.js restituisca { token: "..." }

    // Imposta il token in un cookie HTTP-only
    cookies.set('authToken', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax', // O 'strict'
        maxAge: 60 * 60 * 2 // Esempio: 2 ore
    });

    return json({ message: message });
}