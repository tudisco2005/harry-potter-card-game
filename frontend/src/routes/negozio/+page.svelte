<script>
    import CharacterCard from "../../components/CharacterCard.svelte";
    let { data } = $props();

    let balance = $state(data.user.balance);
    balance = 0;

    const harryData = {
        image: "questionmark.png",
    };

    let isHovered = false;

    // Funzione per toggleare l'animazione
    function toggleAnimation() {
        isHovered = !isHovered;
    }

    let buyCreditModal = $state(false);
    function buyCredits() {
        buyCreditModal = true;
        // Logica per acquistare crediti
        console.log("Crediti acquistati!");
    }

    let openPackageModal = $state(false);
    function openPackage() {
        openPackageModal = true;
        // Logica per aprire il pacchetto
        console.log("Pacchetto aperto!");
    }
</script>

{#if openPackageModal}
    <div class="absolute md:w-10/12 max-w-full h-full md:h-auto z-50">
        <!-- Modal content -->
        <div
            class="relative p-2 border-2 border-gray-600 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-4"
        >
            <button
                type="button"
                class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                on:click={() => (openPackageModal = false)}
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
                            Carte ottenute
                        </h2>
                </div>
            </section>
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
                                class="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 lg:max-w-xl lg:p-8"
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
                                            pattern="^4[0-9]{12}(?:[0-9]{3})?$"
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
                                            <button
                                                data-tooltip-target="cvv-desc"
                                                data-tooltip-trigger="hover"
                                                class="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
                                            >
                                                <svg
                                                    class="h-4 w-4"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
                                                        clip-rule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                            <div
                                                id="cvv-desc"
                                                role="tooltip"
                                                class="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300 dark:bg-gray-700"
                                            >
                                                The last 3 digits on back of
                                                card
                                                <div
                                                    class="tooltip-arrow"
                                                    data-popper-arrow
                                                ></div>
                                            </div>
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
                                    type="submit"
                                    class="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                    >Paga Ora</button
                                >
                            </form>

                            <div class="mt-6 grow sm:mt-8 lg:mt-0">
                                <div
                                    class="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <label for="countries" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleziona la quantità</label>
                                    <select id="countries" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option selected value="10">10 Crediti - 2.99€</option>
                                        <option value="25">25 Crediti - 5.99€</option>
                                        <option value="50">50 Crediti - 9.99€</option>
                                        <option value="99">99 Crediti - 19.99€</option>
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
                                                $6,592.00
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
                                                -$299.00
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
                                                $799
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
                                            $7,191.00
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
                            Attenzione: Questi dati non verrano trasmessi è solo dimostrativo, sconsigliamo di inserire dati reali.
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
        class="py-2 sm:p-6 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-md"
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

            <span class="p-2 mt-2 bg-gray-400 rounded-xl text-black"
                >1 Credito = 1 Pacchetto</span
            >
        </div>
        <div class="order-2 relative lg:scale-100 px-2 pb-12">
            <div class="relative scale-95 w-fit mx-auto group" class:hovered={isHovered}>
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
                    <CharacterCard quantity={1} content={harryData} />
                    <div
                        class="absolute -bottom-14 left-0 right-0 text-center mt-2 lg:hidden"
                    >
                        <button
                            class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                            on:click={() => {
                                if (balance <= 0) {
                                    buyCredits();
                                    return;
                                }
                                toggleAnimation();
                                openPackage();
                            }}
                        >
                            {balance > 0
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
                                if (balance <= 0) {
                                    buyCredits();
                                    return;
                                }
                                toggleAnimation();
                                openPackage();
                            }}
                        >
                            {balance > 0
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
</style>
