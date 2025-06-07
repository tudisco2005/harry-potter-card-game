<script>
    // Importa le funzioni di navigazione di SvelteKit
    import { goto } from '$app/navigation';
    // Importa i componenti di Flowbite per la UI
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider } from 'flowbite-svelte';
    // Importa il componente per la modalità scura
    import { DarkMode } from 'flowbite-svelte';
    
    // Props ricevute dal componente padre
    export let currentPath;    // Percorso corrente
    export let logged;         // Stato di autenticazione
    export let username = "";  // Nome utente
    export let email = ""      // Email utente
    export let balance;        // Saldo crediti

    // Definizione degli elementi della barra di navigazione
    let navItems = [
        { name: 'Album', path: '/album' },
        { name: "Vendi", path: '/vendi' },
        { name: 'Negozio', path: '/negozio' },
        { name: 'Scambi', path: '/scambi' }
    ];

    // Trova l'indice dell'elemento attivo nella barra di navigazione
    let activeIndex = navItems.findIndex(item => item.path === currentPath);

    // Classi CSS per gli stati attivo e inattivo degli elementi della navbar
    let activeClass = 'text-blue-700 dark:text-blue-500';
    let inactiveClass = 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-500';
</script>
  
<!-- Barra di navigazione principale -->
<Navbar>
    <!-- Logo e nome del sito -->
    <NavBrand href="/">
        <img src="logo.jpg" class="me-3 h-9 w-9 rounded-full" alt="Card Game Logo" />
        <span class="self-center whitespace-nowrap text-wrap md:text-xl font-semibold dark:text-white">Il Patto dei Maghi</span>
    </NavBrand>

    <!-- Area destra della navbar -->
    <div class="flex md:order-2">
        <!-- Pulsante modalità scura -->
        <div class="pr-1 mt-1 sm:pr-2 md:pr-3">
            <DarkMode />
        </div>

        {#if !logged} 
            <!-- Pulsante di login per utenti non autenticati -->
            <Button size="sm" href="/login">
                <div class="inline-flex items-center justify-center text-base text-center ">
                    <p class="hidden md:block">Hai già un account</p>
                    <p class="block md:hidden">Accedi</p>
                    <svg class="w-4 h-4 ml-2"  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"/>
                    </svg>               
                </div> 
            </Button>
        {:else}
            <!-- Menu utente per utenti autenticati -->
            <div id="avatar-menu" class="flex items-center space-x-2 md:space-x-3 ">
                <!-- Visualizzazione del saldo crediti -->
                <div class="pl-2 text-sm hidden md:block">{balance} Crediti</div>
                <div>
                    <!-- Avatar utente cliccabile -->
                    <div class="flex items-center md:order-2 border-2 rounded-full border-gray-800 hover:border-gray-400">
                        <Avatar src="user.jpg" />
                    </div>
                    <!-- Menu a tendina dell'utente -->
                    <Dropdown placement="bottom" triggeredBy="#avatar-menu">
                        <DropdownHeader>
                            <span class="block text-sm text-center">{username}</span>
                            <span class="block text-sm text-center md:hidden">{balance} Crediti</span>
                            <span class="block truncate text-sm font-medium">{email}</span>
                        </DropdownHeader>
                        <DropdownItem on:click={() => {goto("/profile")}}>Profilo</DropdownItem>
                        <DropdownItem on:click={() => {goto("/gestisci_scambi")}}>Gestisti Scambi</DropdownItem>
                        <DropdownDivider />
                        <DropdownItem class="text-red-600" on:click={() => {goto("/logout")}}>Esci</DropdownItem>
                    </Dropdown>
                </div>
            </div>
        {/if}
        <!-- Pulsante hamburger per il menu mobile -->
        <NavHamburger />
    </div>

    <!-- Menu di navigazione principale -->
    <NavUl class="order-1">
        {#each navItems as item, index}
            <NavLi href={item.path} class={index === activeIndex ? activeClass : inactiveClass}>
                {item.name}
            </NavLi>
        {/each}
    </NavUl>
</Navbar>