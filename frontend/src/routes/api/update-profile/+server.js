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
            
            const { message } = await response.json();

            if (!response.ok) {
                return json({ message }, { status: response.status });
            }

            return json({ message });
        }
    } catch (error) {
        console.error('Edit error:', error);
        return json({ message: 'Server error' }, { status: 500 });
    }
}
