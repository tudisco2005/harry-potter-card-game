import { PUBLIC_API_SERVER_URL } from '$env/static/public';

// Funzione handle che gestisce le richieste del server

export async function handle({ event, resolve }) {
    // Recupera il token di autenticazione dai cookie
    const token = event.cookies.get('authToken');

    if (token) {
        // Verifica lo stato del token con il server
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/token-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => response.json());

        if (response.ok || response.valid) {
            // Se il token è valido, imposta l'utente come autenticato
            event.locals.user = { isAuthenticated: true, token };

            // Recupera i dettagli dell'utente dal server
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/info`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Se la richiesta ha successo, aggiorna i dettagli dell'utente
                const res = await response.json();
                event.locals.user = {
                    isAuthenticated: true,
                    token: event.locals.user.token,
                    ...res.data
                };
            }
            
            // Gestione degli errori nel recupero dei dettagli utente
            if (!response.ok) {
                console.error('Failed to fetch user details:', response.statusText);
                event.locals.user = { isAuthenticated: false };
            }

        } else {
            // Se il token non è valido, imposta l'utente come non autenticato
            event.locals.user = { isAuthenticated: false };
        }
    } else {
        // Se non c'è token, imposta l'utente come non autenticato
        event.locals.user = { isAuthenticated: false };
    }

    // Risolve la richiesta e restituisce la risposta
    const response = await resolve(event);
    return response;
}