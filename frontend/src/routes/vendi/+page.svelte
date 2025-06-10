<script>
    import { invalidateAll } from "$app/navigation";
    import { onMount } from "svelte";

    let game_cards_filtered = $state([]);
    let selectedCards = $state([]);

    async function loadTable() {
        try {
            const response = await fetch(`/api/search-card?sortBy=quantity`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            game_cards_filtered = data.filtered_game_cards.filter(
                (card) => card.quantity > 1,
            );
        } catch (error) {
            console.error("Errore durante la ricerca delle carte:", error);
            game_cards_filtered = []; // Set to empty array on error to prevent runtime issues
        }
    }

    onMount(() => {
        loadTable();
    });

    function toggleCardSelection(card) {
        success = false;
        errorText = "";
        successText = "";
       
        const index = selectedCards.indexOf(card);

        if (index > -1) {
            selectedCards.splice(index, 1);
        } else {
            selectedCards.push(card);
        }
    }

    const allItemsSelected = $derived(
        game_cards_filtered.length > 0 &&
            selectedCards.length === game_cards_filtered.length,
    );

    
    const isIndeterminate = $derived(
        selectedCards.length > 0 &&
            selectedCards.length < game_cards_filtered.length,
    );

    function handleSelectAllChange(event) {
        if (event.target.checked) {
            // Seleziona tutte le carte filtrate
            selectedCards = [...game_cards_filtered];
        } else {
            // Deseleziona tutte le carte
            selectedCards = [];
        }
    }

    let success = $state(false)
    let successText = $state("")
    let errorText = $state("")

    async function sellCards() {
        // send format [{id, quantity}]
        const cards = selectedCards.map(card => ({ id: card.id, quantity: card.quantity - 1 }));

        await fetch("/api/sellcards", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cards
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Vendita completata:", data);
                success = true;
                errorText = ""
                successText = data.creditsEarned > 0
                    ? `Hai guadagnato ${data.creditsEarned} crediti!`
                    : "Nessun credito guadagnato.";
                // pulisci le carte selezionate dopo la vendita
                selectedCards = [];
                invalidateAll();
                loadTable(); // Reload the table to reflect changes
            })
            .catch((error) => {
                success = false
                errorText = error;
                console.error("Errore durante la vendita delle carte:", error);
            });
    }
</script>

<div class="mx-4">
    <div
        class="py-2 sm:p-6 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-md"
    >
        <div
            class="flex flex-col mb-4 items-center justify-center bg-gray-100 dark:bg-gray-800"
        >
            <span class="text-5xl mb-1 font-semibold text-white hidden md:block"
                >Vendi le tue carte doppie</span
            >
            <span class="text-5xl mb-2 font-semibold text-white md:hidden"
                >Vendi i doppioni</span
            >

            <span class="p-2 my-2 bg-gray-400 rounded-xl text-black"
                >2 Doppioni Uguali = 1 Credito</span
            >
            <span class="text-sm text-gray-500 dark:text-gray-400"
                >Seleziona le carte che vuoi vendere:</span
            >
        </div>
        <div
            class="relative mx-1 sm:mx-4 border-2 border-gray-700 overflow-x-auto items-center justify-center shadow-md rounded-lg"
        >
            <table
                class="w-full text-sm sm:rounded-lg text-left rtl:text-right text-gray-500 dark:text-gray-400"
            >
                <thead
                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
                >
                    <tr>
                        <th scope="col" class="p-4">
                            <div class="flex items-center">
                                <input
                                    id="checkbox-all"
                                    type="checkbox"
                                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    disabled={game_cards_filtered.length === 0}
                                    checked={allItemsSelected}
                                    prop:indeterminate={isIndeterminate}
                                    on:change={handleSelectAllChange}
                                />
                                <label for="checkbox-all" class="sr-only"
                                    >checkbox</label
                                >
                            </div>
                        </th>
                        <th scope="col" class="px-6 py-3">Immagine</th>
                        <th scope="col" class="px-6 py-3">Nome</th>
                        <th scope="col" class="px-6 py-3 hidden sm:table-cell"
                            >Casa</th
                        >
                        <th scope="col" class="px-6 py-3"><p class="hidden md:block">Carte</p> Doppie</th>
                    </tr>
                </thead>
                <tbody>
                    {#if game_cards_filtered.length === 0}
                        <tr>
                            <td
                                colspan="5"
                                class="text-center py-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                                >Nessun doppione trovato</td
                            >
                        </tr>
                    {:else}
                        {#each game_cards_filtered as card, i (card.id || i)}
                            <tr
                                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                                on:click={() => toggleCardSelection(card)}
                            >
                                <td class="w-4 p-4">
                                    <div class="flex items-center">
                                        <input
                                            id={`checkbox-table-${card.id || i}`}
                                            type="checkbox"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            checked={selectedCards.includes(
                                                card,
                                            )}
                                            aria-labelledby={`card-name-${card.id || i}`}
                                            on:click|stopPropagation
                                            on:change={() =>
                                                toggleCardSelection(card)}
                                        />
                                        <label
                                            for={`checkbox-table-${card.id || i}`}
                                            class="sr-only"
                                            on:click|stopPropagation
                                        >
                                            select card {card.name}
                                        </label>
                                    </div>
                                </td>
                                <th
                                    scope="row"
                                    class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                {#if card.image}    
                                    <img
                                            src={card.image}
                                            alt={card.name
                                                ? `Immagine di ${card.name}`
                                                : "Immagine carta"}
                                            class="w-12 h-12 object-contain sm:w-16 sm:h-16 md:w-24 md:h-24 hover:scale-105"
                                        />
                                {:else}
                                <div class="w-full h-full bg-gray-700 flex items-center justify-center">
                                    <span class="text-gray-400 text-sm text-wrap">Immagine non disponibile</span>
                                </div>
                                {/if}
                                </th>
                                <td
                                    class="px-6 py-4"
                                    id={`card-name-${card.id || i}`}
                                    >{card.name}</td
                                >
                                <td class="px-6 py-4 hidden sm:table-cell"
                                    >{card.house}</td
                                >
                                <td class="px-6 py-4">{card.quantity - 1}</td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>

            <div class="w-full mt-3">
                {#if !success}
                    <p class="text-red-500 my-1">{errorText}</p>
                {/if}
                <button
                    disabled={selectedCards.length === 0}
                    class="w-full mt-0 px-4 py-2 {!success ? "bg-blue-500" : "bg-green-500"}  text-white rounded-b-lg disabled:cursor-not-allowed transition-colors duration-300"
                    on:click={() => {
                        sellCards()
                    }}
                >
                    {#if !success}
                        {selectedCards.length > 0 ? `Vendi ${selectedCards.length} carte` : "Nessuna carta selezionata"}
                    {:else}
                        {successText}
                    {/if}
                </button>
            </div>
        </div>
    </div>
</div>
