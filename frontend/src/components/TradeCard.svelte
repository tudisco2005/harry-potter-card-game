<script>
    import CardMiniStack from "./CardMiniStack.svelte";
    export let offeredCardsClick;
    export let askCardsClick;
    export let acceptTradeClick;

    export let offeredCards;
    export let askCards;
</script>


<div
    class="trade-card rounded-2xl p-3 sm:p-6 hover:scale-105 transition-all duration-300"
>
    <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
            <div
                class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
            >
                <span class="text-white font-bold text-sm">AK</span>
            </div>
            <!-- <div
                            class="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center"
                        >
                            <span class="text-white font-bold text-sm">LM</span>
                        </div> -->
            <!-- <div
                            class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center"
                        >
                            <span class="text-white font-bold text-sm">TC</span>
                        </div> -->
            <!-- <div
                            class="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center"
                        >
                            <span class="text-white font-bold text-sm">SK</span>
                        </div> -->
            <div>
                <div class="text-white font-semibold">Alex Knight</div>
                <div class="text-sm text-gray-400">⭐ 4.9 (156 scambi)</div>
            </div>
        </div>
        <div class="text-right">
            <div class="text-xs text-gray-400">Scade tra</div>
            <div class="text-sm text-yellow-400 font-semibold">2 giorni</div>
            <div class="text-sm text-red-400 font-semibold">8 ore</div>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <!-- Carta Offerta -->
        <div class="relative">
            <div class="text-xs text-gray-400 mb-2">OFFRE</div>
            <div on:click = {offeredCardsClick}>
                <CardMiniStack cards={offeredCards} flipDisabled={true}  />
            </div>
            <div
                class="absolute top-4 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
            >
                3
            </div>
        </div>

        <!-- Carta Richiesta -->
        <div class="relative">
            <div class="text-xs text-gray-400 mb-2">CERCA</div>
            <div on:click = {askCardsClick}>
                <CardMiniStack cards={askCards} />
            </div>
            <div
                class="absolute top-4 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
            >
                3
            </div>
        </div>
    </div>

    <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
            <span
                class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full"
                >HOT</span
            >
            <span
                class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full"
                >Nuovo utente</span
            >
            <span
                class="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full"
                >URGENTE</span
            >
        </div>
        <button
        on:click = {acceptTradeClick}
            class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
        >
            Accetta Scambio
        </button>
    </div>
</div>

<style>
    .trade-card {
        background: linear-gradient(135deg, #263244 0%, #202d4a 100%);
        border: 2px solid transparent;
        background-clip: padding-box;
        transition: all 0.3s ease;
    }

    .trade-card:hover {
        border-color: rgba(255, 215, 0, 0.5);
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
</style>
