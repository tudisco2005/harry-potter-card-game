<script>
    import CharacterCard from "./../../components/CharacterCard.svelte";
    import { browser } from '$app/environment';

    let { data } = $props();
    let game_cards = data.user.game_cards;

    // Calcola le statistiche delle carte
    let total_cards_counter = game_cards.length;  // Numero totale di carte
    let uniq_card_counter = game_cards.reduce((sum, card) => sum + (card.quantity > 0 ? 1 : 0), 0);  // Numero di carte uniche

    // Gestione del rendering lazy delle carte
    let renderLimit = $state(30);  // Limite iniziale di carte da visualizzare
    const loadMore = () => {
        renderLimit += 20;  // Aumenta il numero di carte visualizzate
    };

    // Gestione dello scroll e del rendering dinamico
    import { onMount, onDestroy } from "svelte";
    let sentinel;  // Elemento sentinella per il lazy loading
    let lastScrollY = 0;  // Ultima posizione dello scroll

    // Gestisce lo scroll della pagina per il lazy loading
    function onScroll() {
        const currentScrollY = window.scrollY;

        // Scrolling verso il basso: carica più carte quando il sentinel diventa visibile
        if (currentScrollY > lastScrollY && sentinel) {
            const { top } = sentinel.getBoundingClientRect();
            if (top < window.innerHeight) {
                loadMore();
            }
        }
        // Scrolling verso l'alto: gestione intelligente della rimozione delle carte
        else if (currentScrollY < lastScrollY && renderLimit > 30 && sentinel) {
            const scrollDifference = lastScrollY - currentScrollY;
            const { top } = sentinel.getBoundingClientRect();

            // Rimuovi carte solo se hai scrollato significativamente verso l'alto
            if (scrollDifference > 200 && top > window.innerHeight * 1.5) {
                renderLimit = Math.max(30, renderLimit - 10);
            }
            // Reset graduale quando torni in cima alla pagina
            else if (currentScrollY < 100 && renderLimit > 50) {
                renderLimit = Math.max(50, renderLimit - 20);
            }
        }

        lastScrollY = currentScrollY;
    }

    // Inizializzazione e pulizia degli event listener
    onMount(() => {
        lastScrollY = window.scrollY;
        searchCards();
        window.addEventListener("scroll", onScroll);
    });

    onDestroy(() => {
        if (!browser) return;
        window.removeEventListener("scroll", onScroll);
    });

    // Gestione della ricerca e dell'ordinamento
    let searchQuery = $state("");  // Query di ricerca
    let game_cards_filtered = $state(data.user.game_cards);  // Carte filtrate
    let sortingModal = $state(false);  // Stato del modal di ordinamento
    let sortBy = $state("quantity");  // Metodo di ordinamento
    let sortByAttributeName = $state("species");  // Attributo per l'ordinamento

    // Lista degli attributi disponibili per l'ordinamento
    let attributes = [
        "species",
        "gender",
        "house",
        "dateOfBirth",
        "ancestry",
        "eyeColour",
        "hairColour",
        "patronus",
    ];

    // Funzione per cercare e ordinare le carte
    async function searchCards() {
        const params = new URLSearchParams({
            searchQuery,
            sortBy,
            sortByAttributeName,
        });
        await fetch(`/api/search-card?${params.toString()}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Carte trovate:", data);
                game_cards_filtered = data.filtered_game_cards;  // Aggiorna le carte filtrate
            })
            .catch((error) => {
                console.error("Errore durante la ricerca delle carte:", error);
            });
    }

    let helpBox = $state(false);  // Stato del box di aiuto
</script>

<!-- modal ordinamento risultati -->
{#if sortingModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Modal content -->
        <div
            class="relative w-10/12 sm:w-1/3 p-4 border-2 border-gray-600 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5"
        >
            <button
                type="button"
                class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                on:click={(sortingModal = false)}
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
            <div class="flex items-center justify-center mb-4">
                <svg
                    class="w-[24px] h-[24px] text-gray-800 dark:text-white"
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
                        stroke-width="3"
                        d="M7 4v16M7 4l3 3M7 4 4 7m9-3h6l-6 6h6m-6.5 10 3.5-7 3.5 7M14 18h4"
                    />
                </svg>
                <p class="text-gray-800 text-xl dark:text-white">Ordina</p>
            </div>

            <div class="w-11/12 sm:w-full mx-auto mt-4">
                <!-- alfabetico, quantità, attributo -->
                <div class="mb-4 items-center justify-center flex flex-col">
                    <label
                        class="block mb-4 font-medium text-gray-900 dark:text-white"
                    >
                        Scegli il metodo di riordinamento:
                    </label>
                    <div class="flex items-center mb-2">
                        <input
                            type="radio"
                            id="quantity"
                            name="sort-method"
                            value="quantity"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                            bind:group={sortBy}
                            on:change={searchCards}
                        />
                        <label
                            for="quantity"
                            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            Quantità posseduta
                        </label>
                    </div>
                    <div class="flex items-center mb-2">
                        <input
                            type="radio"
                            id="alphabetic"
                            name="sort-method"
                            value="alphabetic"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                            bind:group={sortBy}
                            on:change={searchCards}
                        />
                        <label
                            for="alphabetic"
                            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            Alfabetico (Nome)
                        </label>
                    </div>
                    <div class="flex items-center">
                        <input
                            type="radio"
                            id="attribute"
                            name="sort-method"
                            value="attribute"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                            bind:group={sortBy}
                            on:change={searchCards}
                        />
                        <label
                            for="attribute"
                            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            Alfabetico (Attributo Specifico)
                        </label>
                    </div>
                    <!-- per attributo -->
                    {#if sortBy === "attribute"}
                        <div class="mt-4">
                            <label for="sort-order" class="sr-only"
                                >Ordine di sort</label
                            >
                            <select
                                id="sort-order"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                bind:value={sortByAttributeName}
                                on:click={searchCards}
                            >
                                {#each attributes as attribute}
                                    <option value={attribute}
                                        >{attribute}</option
                                    >
                                {/each}
                            </select>
                        </div>
                    {/if}
                </div>
                <div class="mb-4 items-center justify-center">
                    <label
                        class="block mb-4 font-medium text-gray-900 dark:text-white"
                    >
                        Numero di carte da visualizzare: {renderLimit}
                        {#if renderLimit > game_cards_filtered.length / 3}
                            <div></div>
                            <span class="text-red-500"
                                >(potrebbe rallentare la pagina)</span
                            >
                        {/if}
                    </label>

                    <div class="relative mb-6">
                        <label for="labels-range-input" class="sr-only"
                            >Labels range</label
                        >
                        <input
                            bind:value={renderLimit}
                            id="labels-range-input"
                            type="range"
                            min="25"
                            max={game_cards_filtered.length}
                            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <span
                            class="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6"
                            >Min (25)</span
                        >
                        <span
                            class="text-sm text-gray-500 dark:text-gray-400 absolute start-1/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6"
                            >{(game_cards_filtered.length / 3).toFixed(0)}</span
                        >
                        <span
                            class="text-sm text-gray-500 dark:text-gray-400 absolute start-2/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6"
                        >
                            {(
                                (2 * game_cards_filtered.length - 25) / 3 +
                                25
                            ).toFixed(0)}</span
                        >
                        <span
                            class="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6"
                            >Max ({game_cards_filtered.length})</span
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        on:click={() => (sortingModal = false)}
    ></div>
{/if}

<div class="w-full mt-4 sm:w-full">
    <div class="flex flex-col items-center">
        <form class="flex items-center min-w-11/12 sm:min-w-1/2">
            <label for="simple-search" class="sr-only">Cerca</label>
            <div class="relative w-full">
                <div
                    class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
                >
                    <svg
                        class="w-4 h-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                    </svg>
                </div>
                <input
                    bind:value={searchQuery}
                    on:input={searchCards}
                    on:keydown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault(); // Prevent form submission
                            searchCards();
                        }
                    }}
                    type="text"
                    id="simple-search"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 pe-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Cerca nome, data di nascita, Bacchetta magica, ..."
                    required
                />
                <a
                    type="button"
                    on:click={() => (helpBox = !helpBox)}
                    class="absolute inset-y-0 end-0 flex items-center pe-3"
                >
                    <svg class="w-6 h-6 hover:border-2 rounded-full m-1 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                </a>
                {#if helpBox}
                    <div class="absolute z-10 start-0 mt-2 w-64 p-4 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600">
                        <div class="text-sm text-gray-700 dark:text-gray-300">
                            Puoi cercare per ogni valore presente nelle carte, come nome, data di nascita, Bacchetta magica, ecc. 
                            <br>
                            <hr class="my-2 border-gray-300 dark:border-gray-600">
                            Si può anche cercare per attributi negati come 
                            <kbd class="px-1 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">!human</kbd>
                            per escludere i personaggi umani, o 
                            <kbd class="px-1 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">!gryffindor</kbd> 
                            per cercare solo i personaggi non della casa Griffindor
                        </div>
                    </div>
                {/if}
            </div>
            <button
                class="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                on:click={() => (sortingModal = true)}
                type="button"
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
                        stroke-width="3"
                        d="M12 6h.01M12 12h.01M12 18h.01"
                    />
                </svg>
                <span class="sr-only">Search</span>
            </button>
        </form>
        <!-- ricerce d'esempio -->
        <div class="w-full flex flex-wrap justify-center gap-4 mt-4">
            <button
                on:click={() => {
                    searchQuery = "";
                    searchCards();
                }}
                class="px-4 py-2 text-gray-300 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                >Tutti</button
            >
            <button
                on:click={() => {
                    searchQuery = "gryffindor";
                    searchCards();
                }}
                class="px-4 py-2 text-gray-300 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                >Griffindoro</button
            >
            <button
                on:click={() => {
                    searchQuery = "pure-blood";
                    searchCards();
                }}
                class="px-4 py-2 text-gray-300 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                >Puro Sangue</button
            >
            <button
                on:click={() => {
                    searchQuery = "!human";
                    searchCards();
                }}
                class="px-4 py-2 text-gray-300 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
                >Personaggi Non Umani</button
            >
        </div>
    </div>

    <div class="inline-flex items-center justify-center w-full">
        <hr class="w-full mx-4 h-px my-8 bg-gray-200 border-0 dark:bg-gray-700">
        <span class="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900"> {uniq_card_counter} / {total_cards_counter}</span>
    </div>

    <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
        {#each game_cards_filtered.slice(0, renderLimit) as card}
            <CharacterCard quantity={card.quantity} content={card} />
        {/each}
        {#if game_cards_filtered.length == 0} 
            <div class="p-6 text-white text-center w-full col-span-full">
                Nessuna carta trovata
            </div>
        {/if}

        <!-- Sentinel element to detect scroll position -->
        <div bind:this={sentinel} class="col-span-full h-1"></div>
    </div>
</div>
