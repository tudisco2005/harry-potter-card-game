<script>
    import { PUBLIC_API_SERVER_URL } from '$env/static/public';
    let username = "";
    let favouriteWizard = "";
    let email = "";
    let password = "";
    let confirmPassword = "";
    let errorPsw = "";
    let error = "";
    let success = false;

    function handleSubmit(event) {
        event.preventDefault();
        if (password !== confirmPassword) {
            errorPsw = "Le password non corrispondono";
            return;
        } else if (password.length < 8) {
            errorPsw = "La password deve essere lunga almeno 8 caratteri";
            return;
            
        } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            errorPsw = "La password deve contenere almeno una lettera maiuscola, una minuscola e un numero";
            return;
            
        } else {
            errorPsw = "";
        }

        // send request
        fetch(`${PUBLIC_API_SERVER_URL}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                favouriteWizard,
                email,
                password,
                confirmPassword
            })
        }).then(response => {
            if (response.ok) {
                // Redirect to login page on success after 1.2 seconds
                success = true;
                error = ""
                errorPsw = "";
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1200);
            } else {
                success = false;
                return response.json().then(data => {
                    error = data.message || "Errore durante la registrazione";
                });
            }
        }).catch(err => {
            error = "Errore di rete: " + err.message;
            success = false;
        });
    }
</script>


<section class="bg-gray-50 dark:bg-gray-900 w-10/12 sm:w-auto">
    <div class="w-full px-2 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:max-w-2xl xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 class="text-xl font-bold tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Crea il tuo account
            </h1>
            <form class="space-y-4 md:space-y-6" on:submit={handleSubmit}>
                <!-- Grid container per i campi - 1 colonna su mobile, 2 su desktop -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Come vuoi essere chiamato?</label>
                        <input type="text" name="username" id="username" bind:value={username} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="username" required>
                    </div>
                    <div>
                        <label for="favouriteWizard" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Chi è il tuo mago preferito?</label>
                        <input type="text" name="favouriteWizard" id="favouriteWizard" bind:value={favouriteWizard} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="ron weasley" required>
                    </div>
                    <div class="md:col-span-2">
                        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Indirizzo email</label>
                        <input type="email" name="email" id="email" bind:value={email} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required>
                    </div>
                    <div>
                        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                        <input type="password" name="password" id="password" placeholder="••••••••" bind:value={password} on:input={() => error = ""} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                    </div>
                    <div>
                        <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Conferma password</label>
                        <input type="password" name="confirm-password" id="confirm-password" placeholder="••••••••" bind:value={confirmPassword} on:input={() => error = ""} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                    </div>
                </div>

                {#if errorPsw}
                    <p class="text-sm text-red-500">{errorPsw}</p>
                {/if}
                
                <!-- Elementi che rimangono a larghezza piena -->
                <div class="flex items-start">
                    <div class="flex items-center h-5">
                        <input id="terms" aria-describedby="terms" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required>
                    </div>
                    <div class="ml-3 text-sm">
                        <label for="terms" class="font-light text-gray-500 dark:text-gray-300">Accetto i <a class="font-medium text-primary-600 hover:underline dark:text-primary-500" href="/terms_and_conditions" target="_blank">Termini e le condizioni</a></label>
                    </div>
                </div>
                <button type="submit" class="{"w-full text-white " + (success ? "bg-green-600 disabled dark:bg-green-600 dark:focus:ring-green-800" : "bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800") + " font-medium rounded-lg text-sm px-5 py-2.5 text-center "}">{success ? "Registrazione avvenuta con successo" : "Crea il tuo account"}</button>
                {#if error}
                    <p class="text-sm text-red-500">{error}</p>
                {/if}
                <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                    Hai già un account? <a href="/login" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Accedi qui</a>
                </p>
            </form>
        </div>
    </div>
</section>
