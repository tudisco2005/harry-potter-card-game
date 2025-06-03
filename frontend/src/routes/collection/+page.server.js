// Esempio: src/routes/dashboard/+page.server.js
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_SERVER_URL } from '$env/static/public';

export async function load({ locals, fetch }) {
    if (!locals.user?.isAuthenticated) {
        throw redirect(303, '/login'); // Reindirizza al login se non autenticato
    }

    // Esempio di chiamata autenticata al backend Node.js
    // Il browser invierà automaticamente il cookie `authToken` con questa richiesta
    // se il backend Node.js è sullo stesso dominio o configurato per CORS con credentials.
    // Se invece il backend Node.js è su un dominio diverso e ti aspetti un header "Authorization: Bearer ...",
    // dovrai aggiungere esplicitamente l'header qui.
    try {
        const response = await fetch(`${PUBLIC_API_SERVER_URL}/api/user/profile`, {
            headers: {
                'Authorization': `Bearer ${locals.user.token}`
            }
        });

        if (!response.ok) {
            // Gestisci l'errore, ad esempio token scaduto o non valido
            if (response.status === 401) {
                // Potresti voler invalidare il cookie e reindirizzare al login
                // event.cookies.delete('authToken', { path: '/' });
                throw redirect(303, '/login?error=auth');
            }
            throw new Error(`Errore dal backend: ${response.status}`);
        }

        const data = await response.json();
        return {
            userData: data
        };
    } catch (error) {
        console.error("Errore nel caricamento dei dati del dashboard:", error);
        // Potrebbe essere utile reindirizzare o mostrare un messaggio di errore
        // a seconda della natura dell'errore.
         if (error.status === 303) throw error; // Propaga il redirect
        return { error: "Impossibile caricare i dati del dashboard." };
    }
}