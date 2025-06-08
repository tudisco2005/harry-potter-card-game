import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
     try {
            // Get the token from locals
            const token = locals.user?.token;
    
            if (token) {
                const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/cards/missing`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
    
                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
                }

                if (!response.ok) {
                    return json({ message: data.message || 'Error fetching missing cards' }, { status: response.status });
                }

                const { message, missingCards } = data;
                return json({ message: message || 'Operazione completata', missingCards });
            } else {
                return json({ message: 'Token mancante' }, { status: 401 });
            }
    
        } catch (error) {
            console.error('Error fetching missing cards:', error);
            return json({ message: 'Server error' }, { status: 500 });
        }
};