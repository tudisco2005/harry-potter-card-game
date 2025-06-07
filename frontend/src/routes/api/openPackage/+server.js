import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
    try {
        // Get the token from locals
        const token = locals.user?.token;
        const { quantity } = await request.json();

        if (token) {
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/cards/package/open`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity })
            });

            if (!response.ok) {
                return json({ message: 'Error opening package' }, { status: response.status });
            }

            const { newCards, remainingCredits } = await response.json();

            return json({ message: 'Package opened successfully', newCards, remainingCredits });
        }
        
    } catch (error) {
        console.error('Opening error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}
