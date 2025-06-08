import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
    const { username, favouriteWizard } = await request.json();

    try {
        // Get the token from locals
        const token = locals.user?.token;

        if (token) {
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    favouriteWizard
                })
            });
            
            let data;
            try {
                data = await response.json();
            } catch (e) {
                return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
            }

            const { message } = data;

            if (!response.ok) {
                return json({ message: message || 'Errore durante l\'aggiornamento' }, { status: response.status });
            }

            return json({ message: message || 'Profilo aggiornato con successo' });
        } else {
            return json({ message: 'Token mancante' }, { status: 401 });
        }
    } catch (error) {
        console.error('Edit error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}
