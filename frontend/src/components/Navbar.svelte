<script>
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider } from 'flowbite-svelte';
    import { DarkMode } from 'flowbite-svelte';
    
    export let currentPath;
    
    // TODO: replace with actual authentication state
    export let logged; // Simulate logged in state 

    // currentPath is now received as a prop from the parent component
    let navItems = [
        { name: 'Album', path: '/album' },
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
        <img src="flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" />
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite</span>
    </NavBrand>
    <div class="flex md:order-2">
        <div class="pr-1 sm:pr-2 md:pr-3">
            <DarkMode />
        </div>
        {#if !logged} 
            <Button size="sm" href="/login">Get started</Button>
        {:else}
            <div class="flex items-center md:order-2">
                <Avatar id="avatar-menu" src="profile-picture-3.webp" />
            </div>
            <Dropdown placement="bottom" triggeredBy="#avatar-menu">
            <DropdownHeader>
                <span class="block text-sm">Bonnie Green</span>
                <span class="block truncate text-sm font-medium">name@flowbite.com</span>
            </DropdownHeader>
            <DropdownItem>Profilo</DropdownItem>
            <DropdownItem>Impostazioni</DropdownItem>
            <DropdownDivider />
            <DropdownItem>Sign out</DropdownItem>
            </Dropdown>
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