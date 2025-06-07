import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
     try {
            // Get the token from locals
            const token = locals.user?.token;
    
            if (token) {
                const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/cards/double`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
    
                if (!response.ok) {
                    return json({ message: 'Error fetching double cards' }, { status: response.status });
                }

                const { message, doubleCards } = await response.json();

                return json({ message, doubleCards });
            }
    
        } catch (error) {
            console.error('Error fetching missing cards:', error);
            return json({ message: 'Server error' }, { status: 500 });
        }
};