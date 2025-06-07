import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function GET({ locals, request }) {
    try {
        // Get the token from locals
        const token = locals.user?.token;

        if (token) {
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/my-trades`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

            });

            if (!response.ok) {
                return json({ message: 'Error creating trade' }, { status: response.status });
            }

            
            const { message, trades } = await response.json();

            return json({ message, trades });
        }

    } catch (error) {
        console.error('Trade creation error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}

