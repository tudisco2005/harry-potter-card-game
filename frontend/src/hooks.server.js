// Esempio: src/hooks.server.js
import { PUBLIC_API_SERVER_URL } from '$env/static/public';

export async function handle({ event, resolve }) {
    const token = event.cookies.get('authToken');

    if (token) {
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/validate`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => response.json());

        if (response.ok || response.valid) {
            event.locals.user = { isAuthenticated: true, token };

            // user details
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/allinfo`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const res = await response.json();
                event.locals.user = {
                    isAuthenticated: true,
                    token: event.locals.user.token,
                    ...res.data
                };
            }
            
            //error handling
            if (!response.ok) {
                console.error('Failed to fetch user details:', response.statusText);
                event.locals.user = { isAuthenticated: false };
            }

        } else {
            event.locals.user = { isAuthenticated: false };
        }
    } else {
        event.locals.user = { isAuthenticated: false };
    }

    const response = await resolve(event);
    return response;
}