import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function POST({ cookies, locals }) {
    try {
        // Get the token from locals
        const token = locals.user?.token;

        if (token) {
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return json({ message: 'Error logging out' }, { status: response.status });
            }

            // Delete the authToken cookie
            cookies.delete('authToken', { path: '/' });

            return json({ message: 'Logged out successfully' });
        }

        return json({ message: 'Already logged out' });
        
    } catch (error) {
        console.error('Logout error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}
