import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
    try {
        // Get the token from locals
        const token = locals.user?.token;
        const { amount } = await request.json();

        if (token) {
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/credits/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            });

            if (!response.ok) {
                return json({ message: 'Error buying credits' }, { status: response.status });
            }

            const { message, newBalance } = await response.json();

            return json({ message , newBalance });
        }
        
    } catch (error) {
        console.error('Buying error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}
