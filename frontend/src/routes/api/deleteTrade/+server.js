import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function DELETE({ locals, request }) {
    try {
        // Get the token from locals
        const token = locals.user?.token;
        const { tradeId } = await request.json();

        //console.log('Trade accept request received for tradeId:', tradeId);

        if (token) {
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/trade/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tradeId })
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                return json({ message: 'Errore nel parsing della risposta dal server' }, { status: 500 });
            }

            const { message, trades } = data;

            if (!response.ok) {
                return json({ message: message || 'Errore durante la cancellazione' }, { status: response.status });
            }

            return json({ message: message || 'Cancellazione avvenuta con successo', trades });
        } else {
            return json({ message: 'Token mancante' }, { status: 401 });
        }
    } catch (error) {
        console.error('Trade delete error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}

