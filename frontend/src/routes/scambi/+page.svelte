<script> // @ts-nocheck
    import CharacterCard from "../../components/CharacterCard.svelte";
    import TradeCard from "./../../components/TradeCard.svelte";

    const example = {
        id: "9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8",
        name: "Harry Potter",
        alternate_names: [
            "The Boy Who Lived",
            "The Chosen One",
            "Undesirable No. 1",
            "Potty",
        ],
        species: "human",
        gender: "male",
        house: "Gryffindor",
        dateOfBirth: "31-07-1980",
        yearOfBirth: 1980,
        wizard: true,
        ancestry: "half-blood",
        eyeColour: "green",
        hairColour: "black",
        wand: {
            wood: "holly",
            core: "phoenix tail feather",
            length: 11,
        },
        patronus: "stag",
        hogwartsStudent: true,
        hogwartsStaff: false,
        actor: "Daniel Radcliffe",
        alternate_actors: [],
        alive: true,
        image: "https://ik.imagekit.io/hpapi/harry.jpg",
    };

    let dettailCardsModal = $state(false);
    let dettailCards = $state([]);
    let dettailCardsText = $state("");
    let offerCards = [example, example];
    let askCards = [example];

    function offeredCardsClick() {
        dettailCardsModal = true;
        dettailCards = offerCards;
        dettailCardsText = "Offerte";
    }

    function askCardsClick() {
        dettailCardsModal = true;
        dettailCards = askCards;
        dettailCardsText = "Chieste";
    }

    let createTradeModal = $state(true);
    let expireTimesOptions = [
        {
            text: "1 ora",
        },
        {
            text: "1 giorno",
        },
        {
            text: "5 giorni"
        }
    ]
</script>

{#if dettailCardsModal}
    <div
        class="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
        on:click={() => (dettailCardsModal = false)}
    >
        <!-- Contenitore del modale -->
        <div
            class="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl dark:bg-gray-800 overflow-hidden"
            on:click|stopPropagation
        >
            <!-- Header del modale -->
            <div
                class="flex items-center justify-between p-4 border-b dark:border-gray-600"
            >
                <h2
                    class="text-2xl font-semibold text-gray-900 dark:text-white"
                >
                    Dettagli Carte {dettailCardsText}
                </h2>
                <button
                    type="button"
                    class="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
                    on:click={() => (dettailCardsModal = false)}
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
                <div
                    class="grid grid-cols-1 {dettailCards.length >= 2
                        ? 'sm:grid-cols-2'
                        : ''} {dettailCards.length >= 3
                        ? 'sm:grid-cols-3'
                        : ''} gap-6 justify-items-center"
                >
                    {#each dettailCards as card}
                        <div class="w-full max-w-xs">
                            <CharacterCard quantity={1} content={card} />
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <div
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        on:click={() => (dettailCardsModal = false)}
    ></div>
{/if}

{#if createTradeModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
        on:click={() => (createTradeModal = false)}
    >
        <!-- Modal content -->
        <div
            on:click|stopPropagation
            class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5"
        >
            <!-- Modal header -->
            <div
                class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"
            >
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Add Product
                </h3>
                <button
                    type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-toggle="defaultModal"
                    on:click={() => (createTradeModal = false)}
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
            </div>
            <!-- Modal body -->
            <form action="#">
                <div class="grid gap-4 mb-4 sm:grid-cols-2">
                    <div>
                        <label
                            for="name"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >Doppie</label
                        >
                        <input
                            type="text"
                            name="name"
                            id="name"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            placeholder="Type product name"
                            required=""
                        />
                    </div>
                    <div>
                        <label
                            for="brand"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >Mancanti</label
                        >
                        <input
                            type="text"
                            name="brand"
                            id="brand"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            placeholder="Product brand"
                            required=""
                        />
                    </div> 
                    <div class="sm:col-span-2">
                        <label
                            for="description"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >Scade Tra:</label
                        >
                        <select id="countries" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            {#each expireTimesOptions as option, i}
                                <option selected={i==0} value="{option.text}">{option.text}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                <button
                    type="submit"
                    class="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                    <svg
                        class="mr-1 -ml-1 w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        ><path
                            fill-rule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clip-rule="evenodd"
                        ></path></svg
                    >
                    Crea Scambio
                </button>
            </form>
        </div>
    </div>
    <div
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        on:click={() => (createTradeModal = false)}
    ></div>
{/if}

<div class="w-full sm:w-full">
    <!-- Hero Section -->
    <section class="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div class="text-center mb-12">
            <h2 class="text-5xl md:text-6xl font-bold text-white mb-4">
                Scambi <span class="gradient-text">Disponibili</span>
            </h2>
            <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Scopri migliaia di offerte di scambio da tutti i giocatori.
                Trova la carta perfetta per completare la tua collezione.
            </p>
        </div>

        <!-- Filtri e Ricerca -->
        <div class="glass-effect rounded-2xl p-6 mt-2 mb-8">
            <div class="flex justify-between items-end mb-6 gap-4">
                <div class="sm:flex flex-1 gap-4">
                    <div class="sm:flex-1">
                        <label
                            class="block text-sm font-medium text-gray-300 mb-2"
                            >Cerca carte</label
                        >
                        <div class="relative">
                            <input
                                type="text"
                                placeholder="Nome carta..."
                                class="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                            />
                            <span class="absolute right-3 top-3 text-gray-400"
                                >🔍</span
                            >
                        </div>
                    </div>

                    <div class="sm:flex-shrink-0 mt-2 sm:mt-0">
                        <label
                            class="block text-sm font-medium text-gray-300 mb-2"
                            >Ordina per</label
                        >
                        <select
                            class="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
                        >
                            <option>Più recenti</option>
                            <option>Valore crescente</option>
                            <option>Valore decrescente</option>
                            <option>Scadenza</option>
                        </select>
                    </div>
                    <div class="sm:flex-shrink-0 mt-2 sm:mt-0">
                        <label
                            class="block text-sm font-medium text-gray-300 mb-2"
                            >Crea il tuo scambio</label
                        >
                        <button
                            class="bg-yellow-500 text-white hover:bg-yellow-600 font-medium px-3 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 whitespace-nowrap w-full"
                            on:click={createTradeModal=true}
                            >
                            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7 7V5"/>
                            </svg>
                            Nuovo scambio
                        </button>
                        
                    </div>
                </div>
            </div>

            <div class="flex flex-wrap gap-2 items-center">
                <span class="text-sm text-gray-300">Filtri rapidi:</span>
                <button
                    class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
                >
                    Tutti
                </button>
                <button
                    class="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                >
                    Carte Mancanti
                </button>
                <button
                    class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30 hover:bg-green-500/30 transition-colors"
                >
                    Più di 2 carte
                </button>
            </div>
        </div>
    </section>

    <!-- Lista Scambi -->
    <section class="relative z-10 max-w-7xl mx-auto px-4 pb-20">
        <div class="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <!-- Scambio 1 - Leggendario -->
            <TradeCard
                {offeredCardsClick}
                {askCardsClick}
                offeredCards={offerCards}
                {askCards}
                acceptTradeClick={() => {
                    console.log("scambio accetato");
                }}
            />
        </div>
    </section>
</div>

<style>
    .gradient-text {
        background: linear-gradient(45deg, #f59e0b, #eab308, #f97316);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .glass-effect {
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .card-3d {
        transform-style: preserve-3d;
        transition: all 0.4s ease;
    }

    .card-3d:hover {
        transform: translateY(-8px) rotateX(5deg) rotateY(5deg);
    }
</style>
