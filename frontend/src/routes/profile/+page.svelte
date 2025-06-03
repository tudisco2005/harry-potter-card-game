<script>
    import { formattDate } from "$lib";
    import { goto, invalidateAll } from '$app/navigation';

    let { data } = $props();

    let username = $state(data.user.username);
    let email = data.user.email;
    let favouriteWizard = $state(data.user.favouriteWizard);
    let createdAt = formattDate(data.user.createdAt);
    let game_cards = data.user.game_cards;

    // each card has is anq quantity
    let total_cards_counter = game_cards.reduce((sum, card) => sum + card.quantity, 0);
    let double_cards_counter = game_cards.reduce((sum, card) => sum + (card.quantity > 1 ? card.quantity - 1 : 0), 0);
    let missing_card_counter = game_cards.reduce((sum, card) => sum + (card.quantity === 0 ? 1 : 0), 0);

    let error = $state("");
    let errorRequest = $state("");
    let errorWizard = $state("");
    let success = $state(true); // Inizia come true perché non ci sono modifiche

    // Usa $effect per reagire automaticamente ai cambiamenti in Svelte 5
    $effect(() => {
        // Reset degli errori
        error = "";
        errorWizard = "";

        // Validazione campi vuoti
        let hasErrors = false;
        
        if(username.trim() === "") {
            error = "Il nome utente non può essere vuoto.";
            hasErrors = true;
        }

        if(username.includes("@") === true) {
            error = "il nome utente non deve contenere '@'.";
            hasErrors = true;
        }

        if(favouriteWizard.trim() === "") {
            errorWizard = "Il mago preferito non può essere vuoto.";
            hasErrors = true;
        }

        // Se ci sono errori di validazione, il pulsante rimane disabilitato
        if(hasErrors) {
            success = true; // Disabilita il pulsante
            return;
        }

        // Controlla se i valori sono cambiati rispetto ai valori originali
        const hasChanges = username !== data.user.username || favouriteWizard !== data.user.favouriteWizard;
        
        // success = true significa "nessuna modifica" (pulsante verde/disabilitato)
        // success = false significa "ci sono modifiche" (pulsante blu/abilitato)
        success = !hasChanges;
    });

    function handleSubmit(event) {
        event.preventDefault();
        
        // Controllo finale prima dell'invio
        if(username.trim() === "" || favouriteWizard.trim() === "") {
            checkChanges(); // Aggiorna gli errori
            return;
        }

        // send requesto to api/update-profile
        fetch("/api/update-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username.trim(),
                favouriteWizard: favouriteWizard.trim(),
            }),
        })
        .then((response) => {
            if (!response.ok) {
                // Gestione degli errori di rete o di risposta non valida
                return response.json().then((errorData) => {
                    throw new Error(errorData.message || "Errore durante l'aggiornamento del profilo.");
                });
            }

            invalidateAll();

            // Aggiorna i valori originali con quelli appena salvati
            data.user.username = username.trim();
            data.user.favouriteWizard = favouriteWizard.trim();
            
            error = "";
            errorWizard = "";
            success = true; // Torna allo stato "nessuna modifica"
        })
    }

    let deleteModal = $state(false)
    let errorDeleting = $state("")
    let successDeleting = $state(false)

    async function deleteAccount() {
        // fetch to /api/delete
        const response = await fetch("/api/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            // Handle successful deletion
            errorDeleting = "";
            successDeleting = true;
            invalidateAll();
            
            setInterval(() => {
                goto("/");
            })
        } else {
            // Handle error
            const errorData = await response.json();
            errorDeleting = errorData.message;
            successDeleting = false;
            console.error("[-] Error deleting account:", errorData.message);
        }
    }
</script>

{#if deleteModal}

<div class="absolute p-4  w-full max-w-md h-full md:h-auto z-50">
    <!-- Modal content -->
    <div class="relative p-4 border-2 border-gray-600 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <button type="button" class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" on:click={deleteModal = false}>
            <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            <span class="sr-only">Close modal</span>
        </button>
        <svg class="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
        <p class="mb-4 text-gray-500 dark:text-gray-300">Sei sicuro/a di voler eliminare il tuo profilo</p>
        <div class="p-2 bg-gray-700 text-orange-400 m-4 rounded-xl">

            Verranno eliminati tutti i tuoi progressi irreversibilmente
        </div>
        <p class="text-red-500">{errorDeleting}</p>
        <div class="flex justify-center items-center space-x-4">
            <button on:click={() => deleteModal = false} type="button" class="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                No, non cancellare
            </button>
            <button
                on:click={!successDeleting ? deleteAccount : null}
                disabled={successDeleting}
                class={`py-2 px-3 text-sm font-medium text-center text-white rounded-lg focus:ring-4 focus:outline-none ${
                    successDeleting
                        ? 'bg-green-600 cursor-not-allowed focus:ring-green-300'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900'
                }`}
            >
                {successDeleting ? "Eliminato" : "Si, sono sicuro"}
            </button>
        </div>
    </div>
</div>

<div class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" on:click={() => deleteModal = false}></div>

{/if}

<div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
    <!-- Modal content -->
    <div
        class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5"
    >
        <!-- Modal header -->
        <div
            class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"
        >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Profilo
            </h3>
        </div>
        <form on:submit={handleSubmit}>
            <div class="grid gap-4 mb-4 sm:grid-cols-2">
                <div>
                    <label
                        for="name"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Nome Utente</label
                    >
                    <div class="relative">
                        <div
                            class="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none"
                        >
                            <svg
                                class="w-[20px] h-[20px] text-gray-800 dark:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.3"
                                    d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
                                />
                            </svg>
                        </div>

                        <input
                            type="text"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pe-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            bind:value={username}
                            placeholder={data.user.username}
                        />
                    </div>
                    {#if error}
                        <p class="text-sm text-red-600 dark:text-red-500">{error}</p>
                    {/if}
                </div>
                <div>
                    <label
                        for="email"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Email*</label
                    >
                    <input
                        type="text"
                        disabled
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        value={email}
                    />
                </div>
                <div>
                    <label
                        for="brand"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Mago Preferito</label
                    >
                    <div class="relative">
                        <div
                            class="absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none"
                        >
                            <svg
                                class="w-[20px] h-[20px] text-gray-800 dark:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.3"
                                    d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
                                />
                            </svg>
                        </div>

                        <input
                            type="text"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pe-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            bind:value={favouriteWizard}
                            placeholder={data.user.favouriteWizard}
                        />
                    </div>
                    {#if errorWizard}
                        <p class="text-sm text-red-600 dark:text-red-500">{errorWizard}</p>
                    {/if}
                </div>
                <div>
                    <label
                        for="date"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Data di creazione del profilo*</label
                    >
                    <input
                        disabled
                        type="text"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        value={createdAt}
                    />
                </div>
                <div class="text-sm text-gray-600">
                    * campo non modificabile
                </div>
            </div>
            <div
                class="flex justify-between items-center pt-4 mt-4 border-t sm:mb-5 dark:border-gray-600"
            >
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Statistiche Carte
                </h3>
            </div>
            <section class="border-b pb-4 mb-4 dark:border-gray-600">
                <div
                    class="max-w-screen-xl px-4 py-8 mx-auto text-center lg:px-6"
                >
                    <dl
                        class="grid max-w-screen-md gap-8 mx-auto text-gray-900 sm:grid-cols-3 dark:text-white"
                    >
                        <div class="flex flex-col items-center justify-center">
                            <dt
                                class="mb-2 text-3xl md:text-4xl font-extrabold"
                            >
                                {total_cards_counter}
                            </dt>
                            <dd
                                class="font-light text-gray-500 dark:text-gray-400"
                            >
                                Carte totali
                            </dd>
                        </div>
                        <div class="flex flex-col items-center justify-center">
                            <dt
                                class="mb-2 text-3xl md:text-4xl font-extrabold"
                            >
                                {double_cards_counter}
                            </dt>
                            <dd
                                class="font-light text-gray-500 dark:text-gray-400"
                            >
                                Doppioni
                            </dd>
                        </div>
                        <div class="flex flex-col items-center justify-center">
                            <dt
                                class="mb-2 text-3xl md:text-4xl font-extrabold"
                            >
                                {missing_card_counter}
                            </dt>
                            <dd
                                class="font-light text-gray-500 dark:text-gray-400"
                            >
                                Mancanti
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>

            {#if errorRequest}
                <p class="text-sm text-red-600 dark:text-red-500">{errorRequest}</p>
            {/if}

            <div class="flex items-center space-x-4">
                <button
                    type="submit"
                    disabled={success}
                    class={`text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors ${
                        success
                            ? 'bg-green-700 cursor-not-allowed focus:ring-green-300 dark:bg-green-600 dark:focus:ring-green-800'
                            : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer'
                    }`}
                >
                    {success ? "Aggiornato" : "Aggiorna Profilo"}
                </button>
                <button
                    type="button"
                    on:click={deleteModal = true}
                    class="text-red-600 inline-flex items-center hover:text-white border border-red-600 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                >
                    <svg
                        class="mr-1 -ml-1 w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        ><path
                            fill-rule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clip-rule="evenodd"
                        ></path></svg
                    >
                    Elimina Profilo
                </button>
            </div>
        </form>
    </div>
</div>