import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
    try {
        // Get the token from locals
        const token = locals.user?.token;
        const { offeredCards, requestedCards, expireTime } = await request.json();

        if (token) {
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/trade/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ offeredCards, requestedCards, expireTime })
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
            }

            if (!response.ok) {
                return json({ message: data.message || 'Error creating trade' }, { status: response.status });
            }

            const { message, trade } = data;
            return json({ message: message || 'Trade creato con successo', trade });
        } else {
            return json({ message: 'Token mancante' }, { status: 401 });
        }
    } catch (error) {
        console.error('Trade creation error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}

