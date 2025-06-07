<script>
    import { onMount } from 'svelte';
    import TradeCard from '../../components/TradeCard.svelte';
    import CharacterCard from '../../components/CharacterCard.svelte';
    import { invalidateAll } from '$app/navigation';

    let { data } = $props();

    let dettailCardsModal = $state(false);
    let dettailCards = $state([]);
    let dettailCardsText = $state("");
    let allTrades = $state([]);

    async function offeredCardsClick() {
        dettailCardsModal = true;
        dettailCardsText = "Offerte";
    }

    async function askCardsClick() {
        dettailCardsModal = true;
        dettailCardsText = "Chieste";
    }

    async function getAllMyTrades() {
         try {
            const response = await fetch("/api/getAllMyTrades", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error("Errore nel recupero degli scambi");
            }
            const data = await response.json();
            console.log(data.trades)
            allTrades = data.trades; // Assicurati che la risposta abbia un campo 'trades'
        } catch (error) {
            console.error("Errore di rete:", error);
            return [];
        }
    }

    onMount(() => {
        getAllMyTrades();
    });

    async function deleteTrade(tradeId) {
         try {
            const response = await fetch("/api/deleteTrade", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tradeId
                })
            });
            if (!response.ok) {
                throw new Error("Errore nel recupero degli scambi");
            }
            console.log("scambio cancellato")
            invalidateAll();
            getAllMyTrades();
        } catch (error) {
            console.error("Errore di rete:", error);
            return [];
        }
    }
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
                            <CharacterCard quantity={card.quantity} content={card} />
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
<div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
    <div
        class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5"
    >
        <!-- Modal header -->
        <div
            class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600"
        >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Gestione Richieste di scambio 
            </h3>
        </div>
        
            <div
                class="flex justify-between items-center sm:mb-5 dark:border-gray-600"
            >
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Statistiche Scambi
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
                                {allTrades.length}
                            </dt>
                            <dd
                                class="font-light text-gray-500 dark:text-gray-400"
                            >
                                Scambi totali
                            </dd>
                        </div>
                        <div class="flex flex-col items-center justify-center">
                            <dt
                                class="mb-2 text-3xl md:text-4xl font-extrabold"
                            >
                                {allTrades.filter(trade => trade.status === 'completed').length}
                            </dt>
                            <dd
                                class="font-light text-gray-500 dark:text-gray-400"
                            >
                                Scambi Completati
                            </dd>
                        </div>
                        <div class="flex flex-col items-center justify-center">
                            <dt
                                class="mb-2 text-3xl md:text-4xl font-extrabold"
                            >
                                {allTrades.filter(trade => trade.status === 'open').length}
                            </dt>
                            <dd
                                class="font-light text-gray-500 dark:text-gray-400"
                            >
                                Scambi Aperti
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>
            <div class="grid grid-cols-1 space-y-8">
                {#each allTrades as trade}
                    <TradeCard
                        offeredCardsClick={() => {dettailCards = trade.offered_cardIds; offeredCardsClick()}}
                        askCardsClick={() => {dettailCards = trade.requested_cardIds; askCardsClick()}}
                        offeredCards={trade.offered_cardIds}
                        askCards={trade.requested_cardIds}
                        expireTime={trade.expirateAt}
                        userInitials={data.user.username.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}
                        username={data.user.username}
                        tradeId={trade._id}
                        textButton={"Cancella scambio"}
                        cancelled={trade.status === "cancelled"}
                        completed={trade.status === "completed"}
                        acceptTradeClick={() => {deleteTrade(trade._id)}}
                    />
                {/each}
            </div>
            {#if allTrades.length === 0}
                <p class="text-gray-500 dark:text-gray-400 text-center">
                    Non ci sono scambi da mostrare.
                </p>
            {/if}
    </div>
</div>