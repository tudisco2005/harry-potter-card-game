import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
    try {
        // Get the token from locals
        const token = locals.user?.token;
        const { amount } = await request.json();

        if (token) {
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/credits/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
            }

            if (!response.ok) {
                return json({ message: data.message || 'Error buying credits' }, { status: response.status });
            }

            const { message, newBalance } = data;
            return json({ message: message || 'Acquisto effettuato', newBalance });
        } else {
            return json({ message: 'Token mancante' }, { status: 401 });
        }
        
    } catch (error) {
        console.error('Buying error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}
