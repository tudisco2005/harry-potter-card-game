// Esempio: src/hooks.server.js
import { PUBLIC_API_SERVER_URL } from '$env/static/public';


export async function handle({ event, resolve }) {
    const token = event.cookies.get('authToken');

    if (token) {
        // Per semplicità, lo aggiungiamo direttamente a locals.
        // valida il token mandando una richiesta al tuo backend Node.js

        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/validate`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => response.json());

        if (response.ok || response.valid) {
            event.locals.user = { isAuthenticated: true, token };
        } else {
            event.locals.user = { isAuthenticated: false };
        }
    } else {
        event.locals.user = { isAuthenticated: false };
    }

    const response = await resolve(event);
    return response;
}