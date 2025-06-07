import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';


export async function POST({ locals, request }) {
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

    const data = await response.json();
    return json(data);
};