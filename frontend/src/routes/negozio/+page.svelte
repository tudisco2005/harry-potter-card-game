<script>
    import { invalidateAll } from "$app/navigation";
    import CharacterCard from "../../components/CharacterCard.svelte";
    let { data } = $props();

    let balance = $state(data.user.balance);

    const harryData = {
        name: "?",
        image: "questionmark.png",
    };

    let isHovered = $state(false);

    // Funzione per toggleare l'animazione
    function toggleAnimation() {
        isHovered = !isHovered;
    }

    let buyCreditModal = $state(false);
    let buyOptions = [{
        quantity: 10,
        price: 2.99
    },{
        quantity: 25,
        price: 5.99
    },{
        quantity: 50,
        price: 9.99
    },{
        quantity: 100,
        price: 19.99
    }];

    let amountTobuy = $state(buyOptions[0].quantity)
    let priceToPay = $derived(() => {
        const option = buyOptions.find(opt => opt.quantity === amountTobuy);
        return option ? option.price : -1;
    })
    let successMessage = $state("");
    let success = $state(false)
    async function buyCredits() {
        // Logica per acquistare crediti
        await fetch("/api/buyCredits", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: amountTobuy,
            }), // Invia la quantità di pacchetti da aprire
        })
        .then((response) => response.json())
        .then((dataResponse) => {
            success = true;
            successMessage = dataResponse.message;
            console.log("Crediti acquistati con successo:", dataResponse);
            data.user.balance = dataResponse.newBalance; // Aggiorna il saldo dell'utente
            balance = dataResponse.newBalance; // Aggiorna il saldo dell'utente
            invalidateAll();
            setTimeout(() => {
                buyCreditModal = false;
            }, 200)
        })
        .catch((error) => {
            success = false;
            successMessage = "Errore"
            console.error("Errore nell'apertura del pacchetto:", error);
        });
    }

    let openPackageModal = $state(false);
    let newCards = $state([]); // Array per memorizzare le nuove carte ottenute
    let quantityOptions = [1, 3, 5];
    let quantityOptionsIndex = $state(0);

    function nextQuantity() {
        if (quantityOptionsIndex < quantityOptions.length - 1) {
            quantityOptionsIndex += 1;
        } else {
            quantityOptionsIndex = 0;
        }
    }

    function prevQuantity() {
        if (quantityOptionsIndex > 0) {
            quantityOptionsIndex -= 1;
        } else {
            quantityOptionsIndex = quantityOptions.length - 1;
        }
    }

    async function openPackage() {
        openPackageModal = true;
        // Logica per aprire il pacchetto
        console.log("Pacchetto aperto!");
        await fetch("/api/openPackage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quantity: quantityOptions[quantityOptionsIndex],
            }), // Invia la quantità di pacchetti da aprire
        })
            .then((response) => response.json())
            .then((dataResponse) => {
                console.log("Pacchetto aperto con successo:", dataResponse);
                newCards = dataResponse.newCards; // Supponendo che la risposta contenga le carte ottenute
                data.user.balance = dataResponse.remainingCredits; // Aggiorna il saldo dell'utente
                balance = dataResponse.remainingCredits; // Aggiorna il saldo dell'utente
                invalidateAll();
            })
            .catch((error) => {
                console.error("Errore nell'apertura del pacchetto:", error);
            });
    }
</script>

{#if openPackageModal}
    <!-- Backdrop del modale -->
    <div
        class="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
        on:click={() => (openPackageModal = false)}
    >
        <!-- Contenitore del modale -->
        <div
            class="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl dark:bg-gray-800 overflow-hidden"
        >
            <!-- Header del modale -->
            <div
                class="flex items-center justify-between p-4 border-b dark:border-gray-600"
            >
                <h2
                    class="text-2xl font-semibold text-gray-900 dark:text-white"
                >
                    Carte ottenute
                </h2>
                <button
                    type="button"
                    class="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
                    on:click={() => (openPackageModal = false)}
                >
                    <svg
                        aria-hidden="true"
                        class="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
            </div>

            <!-- Contenuto scorrevole del modale -->
            <div
                class="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar"
            >
                {#if newCards.length === 0}
                    <p
                        class="text-gray-500 dark:text-gray-400 text-center py-8"
                    >
                        Nessuna carta ottenuta.
                    </p>
                {:else}
                    <!-- Grid responsivo per le carte -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center"
                    >
                        {#each newCards as card}
                            <div class="w-full max-w-xs">
                                <CharacterCard
                                    quantity={1}
                                    content={card}
                                />
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <div
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        on:click={() => (openPackageModal = false)}
    ></div>
{/if}
{#if buyCreditModal}
    <div class="absolute md:w-10/12 max-w-full h-full md:h-auto z-50">
        <!-- Modal content -->
        <div
            class="relative p-2 border-2 border-gray-600 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-4"
        >
            <button
                type="button"
                class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                on:click={(buyCreditModal = false)}
            >
                <svg
                    aria-hidden="true"
                    class="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    ><path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                    ></path></svg
                >
                <span class="sr-only">Close modal</span>
            </button>
            <section
                class="bg-white py-8 antialiased dark:bg-gray-900 md:py-16"
            >
                <div class="mx-auto max-w-screen-xl px-4 2xl:px-0">
                    <div class="mx-auto max-w-5xl">
                        <h2
                            class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl"
                        >
                            Acquisto Crediti
                        </h2>

                        <div
                            class="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12"
                        >
                            <form
                                action="#"
                                class="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 lg:max-w-xl"
                            >
                                <div class="mb-6 grid grid-cols-2 gap-4">
                                    <div class="col-span-2 sm:col-span-1">
                                        <label
                                            for="full_name"
                                            class="mb-2 block text-start text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Nome completo (come sulla carta)*
                                        </label>
                                        <input
                                            type="text"
                                            id="full_name"
                                            class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                                            placeholder="Bonnie Green"
                                            required
                                        />
                                    </div>

                                    <div class="col-span-2 sm:col-span-1">
                                        <label
                                            for="card-number-input"
                                            class="mb-2 text-start block text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Numero di carta*
                                        </label>
                                        <input
                                            type="text"
                                            id="card-number-input"
                                            class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pe-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                                            placeholder="xxxx-xxxx-xxxx-xxxx"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            for="card-expiration-input"
                                            class="mb-2 text-start block text-sm font-medium text-gray-900 dark:text-white"
                                            >Data di scadenza*
                                        </label>
                                        <div class="relative">
                                            <div
                                                class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5"
                                            >
                                                <svg
                                                    class="h-4 w-4 text-gray-500 dark:text-gray-400"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                                                        clip-rule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <input
                                                datepicker
                                                datepicker-format="mm/yy"
                                                id="card-expiration-input"
                                                type="text"
                                                class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                placeholder="12/23"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            for="cvv-input"
                                            class="mb-2 text-start flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            CVV*
                                        </label>
                                        <input
                                            type="number"
                                            id="cvv-input"
                                            aria-describedby="helper-text-explanation"
                                            class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                                            placeholder="•••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                on:click = {buyCredits}
                                    type="submit"
                                    class="flex w-full items-center justify-center rounded-lg {success ? "bg-green-600 disabled dark:bg-green-600 dark:focus:ring-green-800" : "bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"} px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-primary-300"
                                    >{success ? successMessage : "Paga Ora"}</button
                                >
                            </form>

                            <div class="mt-6 grow sm:mt-8 lg:mt-0">
                                <div
                                    class="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <label
                                        for="countries"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >Seleziona la quantità</label
                                    >
                                    <select
                                        id="countries"
                                        bind:value={amountTobuy}
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                        {#each buyOptions as option, i}
                                            <option selected={i == 0?  true: false} value={option.quantity}>{option.quantity} Crediti - {option.price}€</option>
                                        {/each}
                                    </select>
                                    <div class="space-y-2">
                                        <dl
                                            class="flex items-center justify-between gap-4"
                                        >
                                            <dt
                                                class="text-base font-normal text-gray-500 dark:text-gray-400"
                                            >
                                                Prezzo di partenza
                                            </dt>
                                            <dd
                                                class="text-base font-medium text-gray-900 dark:text-white"
                                            >
                                                €{(priceToPay() - ((priceToPay()*24) / 100)).toFixed(2)}
                                            </dd>
                                        </dl>

                                        <dl
                                            class="flex items-center justify-between gap-4"
                                        >
                                            <dt
                                                class="text-base font-normal text-gray-500 dark:text-gray-400"
                                            >
                                                Sconto
                                            </dt>
                                            <dd
                                                class="text-base font-medium text-green-500"
                                            >
                                                -€0.00
                                            </dd>
                                        </dl>

                                        <dl
                                            class="flex items-center justify-between gap-4"
                                        >
                                            <dt
                                                class="text-base font-normal text-gray-500 dark:text-gray-400"
                                            >
                                                Tasse
                                            </dt>
                                            <dd
                                                class="text-base font-medium text-gray-900 dark:text-white"
                                            >
                                                €{((priceToPay()*24) / 100).toFixed(2)}
                                            </dd>
                                        </dl>
                                    </div>

                                    <dl
                                        class="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700"
                                    >
                                        <dt
                                            class="text-base font-bold text-gray-900 dark:text-white"
                                        >
                                            Totale
                                        </dt>
                                        <dd
                                            class="text-base font-bold text-gray-900 dark:text-white"
                                        >
                                            €{priceToPay()}
                                        </dd>
                                    </dl>
                                </div>

                                <div
                                    class="mt-6 flex items-center justify-center gap-8"
                                >
                                    <img
                                        class="h-8 w-auto dark:hidden"
                                        src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/paypal.svg"
                                        alt=""
                                    />
                                    <img
                                        class="hidden h-8 w-auto dark:flex"
                                        src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/paypal-dark.svg"
                                        alt=""
                                    />
                                    <img
                                        class="h-8 w-auto dark:hidden"
                                        src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa.svg"
                                        alt=""
                                    />
                                    <img
                                        class="hidden h-8 w-auto dark:flex"
                                        src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa-dark.svg"
                                        alt=""
                                    />
                                    <img
                                        class="h-8 w-auto dark:hidden"
                                        src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard.svg"
                                        alt=""
                                    />
                                    <img
                                        class="hidden h-8 w-auto dark:flex"
                                        src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard-dark.svg"
                                        alt=""
                                    />
                                </div>
                            </div>
                        </div>

                        <p
                            class="mt-6 text-center text-gray-500 dark:text-gray-400 sm:mt-8 lg:text-left"
                        >
                            Attenzione: Questi dati non verrano trasmessi è solo
                            dimostrativo, sconsigliamo di inserire dati reali.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <div
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        on:click={() => (buyCreditModal = false)}
    ></div>
{/if}
<div class="mx-4">
    <div
        class="py-2 sm:px-5 sm:pt-3 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-md"
    >
        <div
            class="flex flex-col mb-4 items-center justify-center bg-gray-100 dark:bg-gray-800"
        >
            <span class="text-5xl mb-1 font-semibold text-white hidden md:block"
                >Espandi la tua collezione</span
            >
            <span class="text-5xl mb-2 font-semibold text-white md:hidden"
                >Apri pacchetti</span
            >

            <div class="flex items-center justify-center space-x-1 mt-2 p-1 border-2 rounded-xl border-gray-500">
                <div on:click={prevQuantity} class="rounded-xl p-1.5 bg-gray-400 hover:bg-gray-500">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                </div>
                <p
                    class="p-2 flex  rounded-xl text-white "
                >
                    {quantityOptions[quantityOptionsIndex]} Credito = {quantityOptions[
                        quantityOptionsIndex
                    ]} Pacchetto
                </p>
                <div on:click={nextQuantity} class="rounded-xl p-1.5 bg-gray-400 hover:bg-gray-500">
                <svg
                    class="w-6 h-6 rounded-lg text-gray-800  dark:text-white"
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
                        stroke-width="2"
                        d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                </svg>
            </div>
            </div>
        </div>
        <div class="order-2 relative lg:scale-100 px-2 pb-12">
            <div
                class="relative scale-92 -m-2 w-fit mx-auto group"
                class:hovered={isHovered}
            >
                <!-- Effetto di luminosità di sfondo -->
                <div
                    class="absolute inset-0 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-full blur-3xl scale-110 lg:scale-125 -z-10 opacity-50"
                ></div>

                <div
                    class="absolute blur-[1px] top-0 left-0 transform opacity-95 scale-95 transition-transform duration-300 group-hover:-rotate-[22deg] group-hover:translate-x-[0.5px] group-hover:translate-y-6"
                    class:card-animation-1={isHovered}
                >
                    <CharacterCard quantity={1} content={harryData} />
                </div>

                <div
                    class="absolute blur-[1px] top-0 left-0 transform opacity-95 scale-95 transition-transform duration-300 group-hover:-rotate-[17deg] group-hover:translate-x-[0.5px] group-hover:translate-y-4"
                    class:card-animation-2={isHovered}
                >
                    <CharacterCard quantity={1} content={harryData} />
                </div>

                <div
                    class="absolute blur-[1px] top-0 left-0 transform opacity-95 scale-95 transition-transform duration-300 group-hover:-rotate-[12deg] group-hover:translate-x-[0.5px] group-hover:translate-y-2"
                    class:card-animation-3={isHovered}
                >
                    <CharacterCard quantity={1} content={harryData} />
                </div>

                <div
                    class="absolute top-0 blur-[1px] left-0 transform opacity-85 scale-98 transition-transform duration-300 group-hover:-rotate-[7deg] group-hover:translate-x-[0.5px]"
                    class:card-animation-4={isHovered}
                >
                    <CharacterCard quantity={1} content={harryData} />
                </div>

                <div
                    class="relative z-10 transform transition-transform duration-300"
                    class:card-animation-main={isHovered}
                >
                    <CharacterCard
                        quantity={5 * quantityOptions[quantityOptionsIndex]}
                        content={harryData}
                    />
                    <div
                        class="absolute -bottom-14 left-0 right-0 text-center mt-2 lg:hidden"
                    >
                        <button
                            class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                            on:click={() => {
                                if (
                                    balance <
                                    quantityOptions[quantityOptionsIndex]
                                ) {
                                    buyCreditModal = true;
                                    return;
                                }
                                toggleAnimation();
                                openPackage();
                            }}
                        >
                            {balance >= quantityOptions[quantityOptionsIndex]
                                ? "Apri pacchetto"
                                : "Acquista crediti"}
                        </button>
                    </div>
                    <div
                        class="absolute -bottom-14 left-0 right-0 text-center mt-2 hidden lg:block"
                    >
                        <button
                            class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                            on:click={() => {
                                if (
                                    balance <
                                    quantityOptions[quantityOptionsIndex]
                                ) {
                                    buyCreditModal = true;
                                    return;
                                }
                                toggleAnimation();
                                openPackage();
                            }}
                        >
                            {balance >= quantityOptions[quantityOptionsIndex]
                                ? "Apri pacchetto"
                                : "Acquista crediti"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Mantieni le animazioni hover per desktop */
    .group:hover .card-animation-1,
    .hovered .card-animation-1 {
        transform: rotate(-22deg) translateX(0.5px) translateY(1.5rem);
    }

    .group:hover .card-animation-2,
    .hovered .card-animation-2 {
        transform: rotate(-17deg) translateX(0.5px) translateY(1rem);
    }

    .group:hover .card-animation-3,
    .hovered .card-animation-3 {
        transform: rotate(-12deg) translateX(0.5px) translateY(0.5rem);
    }

    .group:hover .card-animation-4,
    .hovered .card-animation-4 {
        transform: rotate(-7deg) translateX(0.5px);
    }

    .group:hover .card-animation-main,
    .hovered .card-animation-main {
        transform: scale(1.03);
    }

    /* scroll bar */

    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
        transition: background-color 0.2s ease;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }

    /* Dark mode */
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-track {
        background: #374151;
    }

    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #6b7280;
    }

    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
    }

    /* Firefox */
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #c1c1c1 #f1f1f1;
    }

    :global(.dark) .custom-scrollbar {
        scrollbar-color: #6b7280 #374151;
    }
</style>
