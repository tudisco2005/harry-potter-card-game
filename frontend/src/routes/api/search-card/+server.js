/** @type {import('./$types').RequestHandler} */
import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function GET({ locals, request }) {
    try {
        const token = locals.user?.token;

        request.query = new URL(request.url).searchParams;
        const searchParams = request.query.toString();

        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/cards/search?${searchParams}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "Authorization": `Bearer ${token}`
            }
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
        }

        if (!response.ok) {
            return json({ message: data.message || 'Errore durante la ricerca' }, { status: response.status });
        }

        return json(data);
    } catch (error) {
        console.error('Search card error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
};