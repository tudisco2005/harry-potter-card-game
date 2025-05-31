<script>
	import '../app.css';

	import Navbar from "../components/Navbar.svelte";
    import Footer from '../components/Footer.svelte';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<div>
	{#key $page.url.pathname}
		<Navbar currentPath={$page.url.pathname} logged={false}></Navbar>
	{/key}
	<div class="dark:bg-gray-700">
		{@render children()}
		<Footer></Footer>
	</div>
</div>

