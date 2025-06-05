import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
    if (locals.user?.isAuthenticated) {
        throw redirect(307, '/album');
    } 
}