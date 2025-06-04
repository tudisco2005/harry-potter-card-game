/** @type {import('./$types').RequestHandler} */
import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function GET({ locals, request }) {
    const token = locals.user?.token;

    request.query = new URL(request.url).searchParams;
    const searchParams = request.query.toString();

    const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/searchcards?${searchParams}`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();
    return json(data);
};