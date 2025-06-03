import { PUBLIC_API_SERVER_URL } from "$env/static/public";
import { json } from '@sveltejs/kit';


export async function DELETE({locals, cookies}) {

    const token = locals.user?.token;

    // fetch /api/user/delete with delete method
    const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/delete`, {
        method: 'DELETE',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    if (!response.ok) {
        return json({ message: response.statusText }, { status: response.status });
    }

    if(response.ok) {
        const { message } = await response.json();
        cookies.delete('authToken', { path: '/' });

        return json({ message });
    }
};