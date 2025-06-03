<script>
    import '../app.css';

    import Navbar from "../components/Navbar.svelte";
    import Footer from '../components/Footer.svelte';
    import { page } from '$app/stores';

    let { children, data } = $props();

</script>

<div class="flex flex-col min-h-screen">
    {#key $page.url.pathname || data.user.isAuthenticated}
        <Navbar 
            currentPath={$page.url.pathname} 
            logged={data.user.isAuthenticated}
            username={data.user.username}
            email={data.user.email}
        >
        </Navbar>
    {/key}

    <div class="dark:bg-gray-900 flex flex-col flex-grow">
        <main class="flex-grow flex items-center justify-center pt-2">
            {@render children()}
        </main>
        <Footer></Footer>
    </div>
</div>

