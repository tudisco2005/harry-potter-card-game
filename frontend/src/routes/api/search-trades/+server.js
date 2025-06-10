import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function GET({ locals, request }) {
    try {
        // Recupera i parametri dalla query string
        request.query = new URL(request.url).searchParams;
        const searchParams = request.query.toString();
        
        const token = locals.user?.token;

        // Fai la richiesta al backend
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/trade/search?${searchParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // Aggiungi il token se necessario
            }
        });

        if (!response.ok) {
            throw new Error('Errore durante la ricerca degli scambi');
        }

        const data = await response.json();
        return json(data);

    } catch (error) {
        console.error('Errore durante la ricerca degli scambi:', error);
        return json(
            { message: 'Errore durante la ricerca degli scambi' },
            { status: 500 }
        );
    }
} 