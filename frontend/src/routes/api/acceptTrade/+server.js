import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
    try {
        // Get the token from locals
        const token = locals.user?.token;
        const { tradeId } = await request.json();

        //console.log('Trade accept request received for tradeId:', tradeId);

        if (token) {
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/trade/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tradeId })
            });

            const { message, trades } = await response.json();

            if (!response.ok) {
                return json({ message }, { status: response.status });
            }

            return json({ message, trades });
        }

    } catch (error) {
        console.error('Trade accept error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}

