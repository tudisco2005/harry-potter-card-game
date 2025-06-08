import { PUBLIC_API_SERVER_URL } from "$env/static/public";
import { json } from '@sveltejs/kit';

export async function DELETE({locals, cookies}) {
    try {
        const token = locals.user?.token;

        // fetch /api/user/delete with delete method
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/delete`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
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
            return json({ message: data.message || response.statusText }, { status: response.status });
        }

        const { message } = data;
        cookies.delete('authToken', { path: '/' });
        return json({ message: message || 'Utente eliminato' });
    } catch (error) {
        console.error('Delete user error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
};