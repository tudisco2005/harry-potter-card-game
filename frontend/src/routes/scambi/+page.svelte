<script>
    // @ts-nocheck
    import CharacterCard from "../../components/CharacterCard.svelte";
    import TradeCard from "./../../components/TradeCard.svelte";
    import CardMiniStack from "./../../components/CardMiniStack.svelte";

    let dettailCardsModal = $state(false);
    let dettailCards = $state([]);
    let dettailCardsText = $state("");
    let offerCards = $state([]);
    let askCards = $state([]);

    let offerPossibleCard = $state([]);
    let askPossibleCard = $state([]);

    async function fetchOfferCardsForCreateTrade() {
        await fetch("/api/doubleCards", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then(async (response) => {
                if (!response.ok) {
                    console.error("Errore nel recupero delle carte offerte");
                    return;
                }
                const data = await response.json();
                const doubleCards = data.doubleCards; 

                // ottengo tutti gli scambi e sottraggo le carte già offerte in scambi "open"
                const allTradesResponse = await fetch("/api/getAllMyTrades", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const allTradesData = await allTradesResponse.json();
            
                const openTrades = allTradesData.trades.filter(
                    (trade) => trade.status === "open",
                );
            
                // sottraggo le carte già offerte in scambi "open"
                doubleCards.forEach((card) => {
                    openTrades.forEach((trade) => {
                        const offeredCard = trade.offered_cardIds.find(
                            (offered) => offered.id === card.id,
                        );
                        if (offeredCard) {
                            card.quantity -= offeredCard.quantity;
                        }
                    });
                });

                offerPossibleCard = doubleCards.filter(
                    (card) => card.quantity > 0,
                );
            })
            .catch((error) => {
                console.error("Errore di rete:", error);
            });
    }

    async function fetchMissingCardsForCreateTrade() {
        await fetch("/api/missingCards", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        .then(async (response) => {
            if (!response.ok) {
                console.error("Errore nel recupero delle carte offerte");
                return;
            }
            const data = await response.json();
            askPossibleCard = data.missingCards; // Assicurati che la risposta abbia un campo 'cards'
        })
        .catch((error) => {
            console.error("Errore di rete:", error);
        });
    }

    let createTradeModal = $state(false);
    let expireTimesOptions = [
        {
            text: "1 ora",
        },
        {
            text: "1 giorno",
        },
        {
            text: "5 giorni",
        },
    ];

    // Stato per i modal di selezione
    let selectOfferedCardsModal = $state(false);
    let selectAskCardsModal = $state(false);

    let allTrades = $state([]);
    let searchQuery = $state("");
    let allTradesFiltered = $state(allTrades);

    // Funzione per aprire il modal di selezione carte da offrire
    function openSelectOfferedCards() {
        renderLimit = 30; // Resetta il limite di rendering all'apertura del modale
        createTradeModal = false;
        selectOfferedCardsModal = true;
    }

    function closeSelectOfferedCards() {
        createTradeModal = true;
        selectOfferedCardsModal = false;
    }

    // Funzione per aprire il modal di selezione carte da chiedere
    function openSelectAskCards() {
        renderLimit = 30; // Resetta il limite di rendering all'apertura del modale
        createTradeModal = false;
        selectAskCardsModal = true;
    }

    function closeSelectAskCards() {
        createTradeModal = true;
        selectAskCardsModal = false;
    }

    // render cards in batches
    let renderLimit = $state(30); // Limite di rendering iniziale
    const loadMore = () => {
        renderLimit += 20; // Aumenta il limite di rendering
    };

    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";

    // Sentinel per il caricamento infinito
    let sentinel;
    let sentinelAskCards;
    let sentinelOfferedCards;
    let lastScrollY = 0;

    // Gestore dello scroll per la finestra principale
    function onWindowScroll() {
        const currentScrollY = window.scrollY;

        // Scrolling down: se la sentinel diventa visibile, carica altre carte
        if (currentScrollY > lastScrollY) {
            // Gestisce solo lo scroll della pagina principale, non dei modali
            if (sentinel) {
                const { top } = sentinel.getBoundingClientRect();
                if (top < window.innerHeight) {
                    loadMore();
                }
            }
        }
        // Scrolling up: gestione per "rimuovere" carte quando si torna su
        else if (currentScrollY < lastScrollY && renderLimit > 30 && sentinel) {
            const scrollDifference = lastScrollY - currentScrollY;
            const { top } = sentinel.getBoundingClientRect();

            if (scrollDifference > 200 && top > window.innerHeight * 1.5) {
                renderLimit = Math.max(30, renderLimit - 10);
            }
            else if (currentScrollY < 100 && renderLimit > 50) {
                renderLimit = Math.max(50, renderLimit - 20);
            }
        }

        lastScrollY = currentScrollY;
    }
    
    // Gestore dello scroll per i modali
    function onModalScroll(event) {
        const container = event.currentTarget;
        const containerRect = container.getBoundingClientRect();

        // Controlla quale modale è attivo e usa la sua sentinel specifica
        if (selectAskCardsModal && sentinelAskCards) {
            const sentinelRect = sentinelAskCards.getBoundingClientRect();
            // Se la parte superiore della sentinel è visibile nel container, carica di più
            if (sentinelRect.top < containerRect.bottom) {
                loadMore();
            }
        } else if (selectOfferedCardsModal && sentinelOfferedCards) {
            const sentinelRect = sentinelOfferedCards.getBoundingClientRect();
            // Se la parte superiore della sentinel è visibile nel container, carica di più
            if (sentinelRect.top < containerRect.bottom) {
                loadMore();
            }
        }
    }


    onMount(() => {
        lastScrollY = window.scrollY;
        if (!browser) return;
        // Aggiunge il listener solo per lo scroll della pagina principale
        window.addEventListener("scroll", onWindowScroll);

        // Inizializza le carte offerte e chieste
        search();
        allTradesFiltered = allTrades;
        fetchMissingCardsForCreateTrade();
        fetchOfferCardsForCreateTrade();
    });

    onDestroy(() => {
        if (!browser) return;
        // Rimuove il listener per lo scroll della pagina principale
        window.removeEventListener("scroll", onWindowScroll);
    });

    // Stato per le carte selezionate
    let selectedOfferedCards = $state([]);
    let selectedAskCards = $state([]);

    function addOfferedCardToSelectedCards(card) {
        return () => {
            if (selectedOfferedCards.includes(card)) {
                selectedOfferedCards = selectedOfferedCards.filter(
                    (c) => c !== card,
                );
            } else {
                selectedOfferedCards = [...selectedOfferedCards, card];
            }
        };
    }

    function addAskCardToSelectedCards(card) {
        return () => {
            if (selectedAskCards.includes(card)) {
                selectedAskCards = selectedAskCards.filter((c) => c !== card);
            } else {
                selectedAskCards = [...selectedAskCards, card];
            }
        };
    }

    let success = $state(false);
    let errorBox = $state(false);
    let errorText = $state("");
    let expireTime = $state("1 ora");

    async function createTrade(event) {
        event.preventDefault();
        if (
            selectedOfferedCards.length === 0 ||
            selectedAskCards.length === 0
        ) {
            errorBox = true;
            success = false;
            errorText =
                "Seleziona almeno una carta da offrire e una da chiedere.";
            return;
        }

        // calcola il tempo in cui lo scambio scade usando il valore selezionato
        let expireTimeInMs = {
            "1 ora": 3600000,
            "1 giorno": 86400000,
            "5 giorni": 432000000,
        }[expireTime];

        if (!expireTimeInMs) {
            errorBox = true;
            success = false;
            errorText = "Tempo di scadenza non valido.";
            return;
        }

        const expireDate = new Date(Date.now() + expireTimeInMs);

        selectedOfferedCards.forEach((card) => {
            if (card.quantity > 1) {
                card.quantity = 1;
            }
        });

        selectedAskCards.forEach((card) => {
            card.quantity = 1;
            card.alredyRequested = true;
        });

        await fetch("/api/createTrade", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                offeredCards: selectedOfferedCards,
                requestedCards: selectedAskCards,
                expireTime: expireDate,
            }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    errorBox = true;
                    success = false;
                    errorText = "Errore durante la creazione dello scambio.";
                    return;
                }

                const { message, trade } = await response.json();

                console.log("Scambio creato con successo!");
                success = true;
                errorBox = false;
                errorText = "";
                selectedOfferedCards = [];
                selectedAskCards = [];
                fetchOfferCardsForCreateTrade();
                fetchMissingCardsForCreateTrade();
                invalidateAll();
                setTimeout(() => {
                    createTradeModal = false;
                }, 200);
            })
            .catch((error) => {
                errorBox = true;
                success = false;
                errorText = "Errore di rete: " + error.message;
            });
    }

    function resetCreateTradeModal() {
        selectedOfferedCards = [];
        selectedAskCards = [];
        expireTime = "1 ora";
        success = false;
        errorBox = false;
        errorText = "";
    }

    async function offeredCardsClick() {
        dettailCardsModal = true;
        dettailCardsText = "Offerte";
    }

    async function askCardsClick() {
        dettailCardsModal = true;
        dettailCardsText = "Chieste";
    }

    let errorTradeModal = $state(false);
    let errorTradeMessage = $state("");
    async function acceptTradeClick(tradeId) {
        await fetch("/api/acceptTrade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tradeId }),
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    console.error("Errore nell'accettare lo scambio");
                    errorTradeModal = true;
                    search();
                    errorTradeMessage = data.message;
                    return;
                }
                errorTradeModal = false;
                errorTradeMessage = "";
                // find trade 
                allTradesFiltered = allTradesFiltered.map((trade) => {
                    if (trade._id === tradeId) {
                        trade.accepted = true;
                    }
                    return trade;
                });

                setTimeout(async () => {
                    await search();
                    await invalidateAll();
                }, 200)
            })
            .catch((error) => {
                errorTradeModal = true;
                errorTradeMessage =
                    "Errore durante l'accettazione dello scambio: " +
                    error.message;
                console.error("Errore di rete:", error);
            });
    }

    let sortBy = $state("recent");
    async function search() {
        // fai una richiesta ad /api/search-trades

        searchQuery = searchQuery.trim();
        await fetch(`/api/search-trades?searchQuery=${searchQuery}&sortBy=${sortBy}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then(async (response) => {
                if (!response.ok) {
                    console.error("Errore nella ricerca degli scambi");
                    return;
                }
                const data = await response.json();
                allTradesFiltered = data.trades;
            })
            .catch((error) => {
                console.error("Errore di rete:", error);
            });
    }
</script>

{#if errorTradeModal}
    <div
        class="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
        on:click={() => (errorTradeModal = false)}
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
                    Errore nello scambio
                </h2>
                <button
                    type="button"
                    class="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
                    on:click={() => (errorTradeModal = false)}
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
            <div class="p-6 text-white">
                {errorTradeMessage}
            </div>
        </div>
    </div>

    <div
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        on:click={() => (errorTradeModal = false)}
    ></div>
{/if}

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
                            <CharacterCard
                                quantity={card.quantity}
                                content={card}
                            />
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
            <form>
                <div class="grid gap-4 mb-4">
                    <div>
                        <label
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Carte che offri
                        </label>
                        <div class="flex flex-col gap-2">
                            <button
                                type="button"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                on:click={openSelectOfferedCards}
                            >
                                Seleziona carte da offrire ({selectedOfferedCards.length})
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Carte che cerchi
                        </label>
                        <div class="flex flex-col gap-2">
                            <button
                                type="button"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                on:click={openSelectAskCards}
                            >
                                Seleziona carte che cerchi ({selectedAskCards.length})
                            </button>
                        </div>
                    </div>

                    <div class="sm:col-span-2">
                        <label
                            for="description"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Scade Tra:
                        </label>
                        <select
                            bind:value={expireTime}
                            id="countries"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            {#each expireTimesOptions as option, i}
                                <option selected={i == 0} value={option.text}
                                    >{option.text}</option
                                >
                            {/each}
                        </select>
                    </div>
                </div>
                <div>
                    {#if errorBox}
                        <div
                            class="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:bg-red-200 dark:text-red-800"
                            role="alert"
                        >
                            <span class="font-medium">Errore!</span>
                            {errorText}
                        </div>
                    {/if}
                    <button
                        disabled={success}
                        on:click={createTrade}
                        type="submit"
                        class="text-white inline-flex items-center {success
                            ? 'bg-green-600 '
                            : ' dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 bg-primary-700 hover:bg-primary-800'} focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
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
                        {success
                            ? "Scambio creato con successo"
                            : "Crea Scambio"}
                    </button>
                </div>
            </form>
        </div>
    </div>
    <div
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        on:click={() => (createTradeModal = false)}
    ></div>
{/if}

<!-- Modal per selezionare le carte da offrire -->
{#if selectOfferedCardsModal}
    <div
        class="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
        on:click={closeSelectOfferedCards}
    >
        <!-- Contenitore del modale -->
        <div
            class="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl dark:bg-gray-800 flex flex-col"
            on:click|stopPropagation
        >
            <!-- Header del modale -->
            <div
                class="flex items-center justify-between p-4 border-b dark:border-gray-600 flex-shrink-0"
            >
                <h2
                    class="text-2xl font-semibold text-gray-900 dark:text-white"
                >
                    Carte da Offrire
                </h2>
                <button
                    type="button"
                    class="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
                    on:click={closeSelectOfferedCards}
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
            <div class="flex-1 overflow-y-auto p-4" on:scroll={onModalScroll}>
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                >
                    {#if offerPossibleCard.length === 0}
                        <div class="col-span-full text-center text-gray-500">
                            Nessuna carta disponibile da offrire.
                        </div>
                    {/if}
                    {#each offerPossibleCard.slice(0, renderLimit) as card}
                        <div
                            on:click={addOfferedCardToSelectedCards(card)}
                            class="cursor-pointer {selectedOfferedCards.includes(
                                card,
                            )
                                ? 'border-2 border-blue-700 bg-blue-600 py-2 rounded-xl'
                                : ''}"
                        >
                            <CharacterCard
                                flipDisabled={true}
                                quantity={card.quantity}
                                content={card}
                            />
                        </div>
                    {/each}

                    <!-- Sentinel element to detect scroll position -->
                    <div
                        bind:this={sentinelOfferedCards}
                        class="col-span-full h-1"
                    ></div>
                </div>
            </div>

            <!-- Bottone OK centrato in basso al modal -->
            {#if selectedOfferedCards.length > 0}
                <div
                    class="flex justify-center p-4 border-t dark:border-gray-600 flex-shrink-0"
                >
                    <button
                        type="button"
                        class="bg-blue-600 text-white text-sm font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 text-lg transition-colors"
                        on:click={closeSelectOfferedCards}
                    >
                        Conferma Offerte ({selectedOfferedCards.length})
                    </button>
                </div>
            {/if}
        </div>
    </div>

    <div
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        on:click={closeSelectOfferedCards}
    ></div>
{/if}

<!-- Modal per selezionare le carte da chiedere -->
{#if selectAskCardsModal}
    <div
        class="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
        on:click={closeSelectAskCards}
    >
        <!-- Contenitore del modale -->
        <div
            class="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl dark:bg-gray-800 flex flex-col"
            on:click|stopPropagation
        >
            <!-- Header del modale -->
            <div
                class="flex items-center justify-between p-4 border-b dark:border-gray-600 flex-shrink-0"
            >
                <h2
                    class="text-2xl font-semibold text-gray-900 dark:text-white"
                >
                    Carte da Chiedere
                </h2>
                <button
                    type="button"
                    class="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
                    on:click={closeSelectAskCards}
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
            <div class="flex-1 overflow-y-auto p-4" on:scroll={onModalScroll}>
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                >
                    {#if askPossibleCard.length === 0}
                        <div class="col-span-full text-center text-gray-500">
                            Nessuna carta disponibile da chiedere.
                        </div>
                    {/if}
                    {#each askPossibleCard.slice(0, renderLimit) as card}
                        <div
                            on:click={addAskCardToSelectedCards(card)}
                            class="cursor-pointer {selectedAskCards.includes(
                                card,
                            )
                                ? 'border-2 border-blue-700 bg-blue-600 py-2 rounded-xl'
                                : ''}"
                        >
                            <CharacterCard
                                flipDisabled={true}
                                quantity={card.quantity}
                                content={card}
                                requested={card.alreadyRequested}
                            />
                        </div>
                    {/each}

                    <!-- Sentinel element to detect scroll position -->
                    <div
                        bind:this={sentinelAskCards}
                        class="col-span-full h-1"
                    ></div>
                </div>
            </div>

            <!-- Bottone OK centrato in basso al modal -->
            {#if selectedAskCards.length > 0}
                <div
                    class="flex justify-center p-4 border-t dark:border-gray-600 flex-shrink-0"
                >
                    <button
                        type="button"
                        class="bg-blue-600 text-white text-sm font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 text-lg transition-colors"
                        on:click={closeSelectAskCards}
                    >
                        Conferma Offerte ({selectedAskCards.length})
                    </button>
                </div>
            {/if}
        </div>
    </div>

    <div
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        on:click={closeSelectAskCards}
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
                                bind:value={searchQuery}
                                on:input={search}
                                type="text"
                                placeholder="Nome carta che vuoi ricevere, nome utente..."
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
                            on:click={search}
                            bind:value={sortBy}
                            class="w-full bg-gray-800/50 border mr-3 border-gray-600 rounded-lg px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
                        >
                            <option value="recent">Più recenti</option>
                            <option value="expiring">Scadenza</option>
                        </select>
                    </div>
                    <div class="sm:flex-shrink-0 mt-2 sm:mt-0">
                        <label
                            class="block text-sm font-medium text-gray-300 mb-2"
                            >Crea il tuo scambio</label
                        >
                        <button
                            class="bg-yellow-500 text-white hover:bg-yellow-600 font-medium px-3 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 whitespace-nowrap w-full"
                            on:click={() => {
                                resetCreateTradeModal();
                                createTradeModal = true;
                            }}
                        >
                            <svg
                                class="w-5 h-5"
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
                                    d="M5 12h14m-7 7V5"
                                />
                            </svg>
                            Nuovo scambio
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex flex-wrap gap-2 items-center">
                <span class="text-sm text-gray-300">Filtri rapidi:</span>
                <button
                    on:click={() => {
                        searchQuery = "";
                        search();
                    }}
                    class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
                >
                    Tutti
                </button>
                <button
                    on:click={() => {
                        allTradesFiltered = allTrades.filter((trade) =>
                            trade.offered_cardIds.some((card) =>
                                askPossibleCard.some(
                                    (missing) => missing.id === card.id,
                                ),
                            ),
                        );
                    }}
                    class="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                >
                    Carte Mancanti
                </button>
                <button
                    on:click={() => {
                        allTradesFiltered = allTrades.filter(
                            (trade) => trade.offered_cardIds.length > 1,
                        );
                    }}
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
            {#each allTradesFiltered.slice(0, renderLimit) as trade}
                <TradeCard
                    offeredCardsClick={() => {
                        dettailCards = trade.offered_cardIds;
                        offeredCardsClick();
                    }}
                    askCardsClick={() => {
                        dettailCards = trade.requested_cardIds;
                        askCardsClick();
                    }}
                    offeredCards={trade.offered_cardIds}
                    askCards={trade.requested_cardIds}
                    expireTime={trade.expirateAt}
                    userInitials={trade.offererInfo.userInitials}
                    rating={trade.offererInfo.rating}
                    completedTrades={trade.offererInfo.completedTrades}
                    username={trade.offererInfo.username}
                    tradeId={trade._id}
                    completed={trade.accepted}
                    acceptTradeClick={() => acceptTradeClick(trade._id)}
                />
            {/each}
            {#if allTradesFiltered.length == 0} 
                <div class="p-6 text-white text-center w-full col-span-full">
                    Nessuno scambio trovato
                </div>
            {/if}
        </div>
        <!-- Sentinel per lo scroll della pagina principale -->
        <div bind:this={sentinel} class="h-1"></div>
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