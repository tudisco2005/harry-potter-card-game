<script>
    // Importa gli stili CSS globali dell'applicazione
    import '../app.css';

    // Importa i componenti principali
    import Navbar from "../components/Navbar.svelte";
    import Footer from '../components/Footer.svelte';
    // Importa lo store della pagina per accedere all'URL corrente
    import { page } from '$app/stores';

    // Riceve le props children (contenuto della pagina) e data (dati del server)
    let { children, data } = $props();
</script>

<!-- Layout principale dell'applicazione -->
<div class="flex flex-col min-h-screen">
    {#key $page.url.pathname || data.user.isAuthenticated}
        <!-- 
            Navbar che si aggiorna quando cambia il percorso o lo stato di autenticazione
            Passa le informazioni dell'utente e il percorso corrente
        -->
        <Navbar 
            currentPath={$page.url.pathname} 
            logged={data.user.isAuthenticated}
            username={data.user.username}
            email={data.user.email}
            balance={data.user.balance}
        >
        </Navbar>
    {/key}

    <!-- Contenitore principale con sfondo scuro -->
    <div class="dark:bg-gray-900 flex flex-col flex-grow">
        <!-- Area principale del contenuto -->
        <main class="flex-grow flex items-center justify-center pt-2">
            {@render children()}
        </main>
        <!-- Footer dell'applicazione -->
        <Footer></Footer>
    </div>
</div>

