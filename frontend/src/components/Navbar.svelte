<script>
    import { goto } from '$app/navigation';
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider } from 'flowbite-svelte';
    import { DarkMode } from 'flowbite-svelte';
    
    export let currentPath;
    
    // TODO: replace with actual authentication state
    export let logged; // Simulate logged in state 
    export let username = ""; // Simulate username
    export let email = ""
    export let balance;

    // currentPath is now received as a prop from the parent component
    let navItems = [
        { name: 'Album', path: '/album' },
        { name: "Vendi", path: '/vendi' },
        { name: 'Negozio', path: '/negozio' },
        { name: 'Scambi', path: '/scambi' }
    ];

    // higlight the current page in the navbar, if the current page is not in the navbar not highlight it
    let activeIndex = navItems.findIndex(item => item.path === currentPath);

    // Define classes for active and inactive states
    let activeClass = 'text-blue-700 dark:text-blue-500';
    let inactiveClass = 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-500';
</script>
  
<Navbar>
    <NavBrand href="/">
        <img src="logo.jpg" class="me-3 h-9 w-9 rounded-full" alt="Card Game Logo" />
        <span class="self-center whitespace-nowrap text-wrap md:text-xl font-semibold dark:text-white">Il Patto dei Maghi</span>
    </NavBrand>
    <div class="flex md:order-2">
        <div class="pr-1 mt-1 sm:pr-2 md:pr-3">
            <DarkMode />
        </div>
        {#if !logged} 
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
            <div id="avatar-menu" class="flex items-center space-x-2 md:space-x-3 ">
                <div class="pl-2 text-sm hidden md:block">{balance} Crediti</div>
                <div>
                    <div class="flex items-center md:order-2 border-2 rounded-full border-gray-800 hover:border-gray-400">
                        <Avatar src="user.jpg" />
                    </div>
                    <Dropdown placement="bottom" triggeredBy="#avatar-menu">
                    <DropdownHeader>
                        <span class="block text-sm text-center">{username}</span>
                        <span class="block text-sm text-center md:hidden">{balance} Crediti</span>
                        <span class="block truncate text-sm font-medium">{email}</span>
                    </DropdownHeader>
                    <DropdownItem on:click={() => {goto("/profile")}}>Profilo</DropdownItem>
                    <DropdownItem on:click={() => {goto("/payment")}}>Pagamento</DropdownItem>

                    <DropdownDivider />
                    <DropdownItem class="text-red-600" on:click={() => {goto("/logout")}}>Esci</DropdownItem>
                    </Dropdown>
                </div>
            </div>
        {/if}
        <NavHamburger />
    </div>
    <NavUl class="order-1">
        {#each navItems as item, index}
            <NavLi href={item.path} class={index === activeIndex ? activeClass : inactiveClass}>
                {item.name}
            </NavLi>
        {/each}
    </NavUl>
</Navbar>