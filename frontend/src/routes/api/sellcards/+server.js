import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
    try {
        const token = locals.user?.token;
        const { cards } = await request.json();

        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/cards/sell`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({cards: cards})
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
        }

        if (!response.ok) {
            return json({ message: data.message || 'Errore durante la vendita' }, { status: response.status });
        }

        return json(data);
    } catch (error) {
        console.error('Sell cards error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
};