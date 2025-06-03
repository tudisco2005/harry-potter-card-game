<script>
    import { PUBLIC_API_SERVER_URL } from '$env/static/public';
    
    let username_email = "";
    let password = "";
    let error = "";
    let success = false;
    let isLoading = false;

    async function handleSubmit(event) {
        event.preventDefault();
        
        if (isLoading) return; // Prevent multiple submissions
        
        isLoading = true;
        error = "";
        
        try {
            const response = await fetch(`${PUBLIC_API_SERVER_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "username": username_email,
                    password
                })
            });

            if (response.ok) {
                const data = await response.json();
                success = true;
                
                // Set token in the store
                token.set(data.token);

                // Redirect to collection page after success
                // setTimeout(() => {
                //     goto('/collection');
                // }, 1200);
            } else {
                const data = await response.json();
                error = data.message || "Errore durante l'accesso";
                success = false;
            }
        } catch (err) {
            error = "Errore di rete: " + err.message;
            success = false;
        } finally {
            isLoading = false;
        }
    }
</script>

<section class="bg-gray-50 dark:bg-gray-900 w-10/12 sm:w-3/12">
    <div class="w-full px-2 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:max-w-2xl xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 class="text-xl font-bold tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Accedi al tuo account
            </h1>
            <form class="space-y-4 md:space-y-6" on:submit={handleSubmit}>
                <div class="md:col-span-2">
                    <label for="email/username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Indirizzo Email o Username</label>
                    <input type="email/username" name="email/username" id="email/username" bind:value={username_email} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com or username" required>
                </div>
                <div>
                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input type="password" name="password" id="password" bind:value={password} placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                </div>
                <button type="submit" class="{"w-full text-white " + (success ? "bg-green-600 disabled dark:bg-green-600 dark:focus:ring-green-800" : "bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800") + " font-medium rounded-lg text-sm px-5 py-2.5 text-center "}">{success ? "Accesso avvenuto con successo" : "Accedi al tuo account"}</button>
                {#if error}
                    <p class="text-sm text-red-500">{error}</p>
                {/if}
            </form>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                Non hai un Account? <a href="/register" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Registrati qui</a>
            </p>
        </div>
    </div>
</section>