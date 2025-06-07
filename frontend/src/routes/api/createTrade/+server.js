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

            if (!response.ok) {
                return json({ message: 'Error creating trade' }, { status: response.status });
            }

            const { message, trade } = await response.json();

            return json({ message, trade });
        }

    } catch (error) {
        console.error('Trade creation error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}

