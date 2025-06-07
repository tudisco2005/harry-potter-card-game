<script>
    import CardMiniStack from "./CardMiniStack.svelte";
    export let offeredCardsClick;
    export let askCardsClick;
    export let acceptTradeClick;
    export let tradeId;

    export let offeredCards;
    export let askCards;

    export let expireTime;
    export let rating = "";
    export let username;
    export let userInitials;
    export let completedTrades = "";
    export let cancelled = false;
    export let completed = false;
    export let textButton = "Accetta scambio"

    function formatExpireTime(expireTime) {
        const now = new Date();
        const expireDate = new Date(expireTime);
        const diff = expireDate - now;

        if (diff <= 0) return "Scaduto";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        let result = "";
        if (days > 0) result += `${days} giorni `;
        if (hours > 0) result += `${hours} ore `;
        if (minutes > 0) result += `${minutes} minuti`;

        return result.trim() || "Meno di un minuto";
    }
</script>


<div
    class="trade-card rounded-2xl p-3 sm:p-6 hover:scale-105 transition-all duration-300"
>
    <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
            <div
                class="w-10 h-10 rounded-full flex items-center justify-center"
                style={"background: linear-gradient(135deg, #" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0') + ", #" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0') + ")"}
            >
                <span class="text-white font-bold text-sm">{userInitials}</span>
            </div>
            <div>
                <div class="text-white font-semibold">{username}</div>
                {#if rating !== ""}
                    <div class="text-sm text-gray-400">⭐ {rating} ({completedTrades} scambi)</div>
                {/if}
            </div>
        </div>
        <div class="text-right">
            <div class="text-xs text-gray-400">Scade tra</div>

            <div
                class="text-sm font-semibold"
                class:text-green-400={new Date(expireTime) - new Date() > 3 * 24 * 60 * 60 * 1000}
                class:text-red-400={new Date(expireTime) - new Date() < 24 * 60 * 60 * 1000}
                class:text-yellow-400={
                    new Date(expireTime) - new Date() <= 3 * 24 * 60 * 60 * 1000 &&
                    new Date(expireTime) - new Date() >= 24 * 60 * 60 * 1000
                }
            >
                {completed ? "Gia completato" : cancelled ? "cancellato" : formatExpireTime(expireTime)}
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <!-- Carta Offerta -->
        <div class="relative">
            <div class="text-xs text-gray-400 mb-2">OFFRE {offeredCards.length > 0 ? `(${offeredCards.length} Carte)` : ''}</div>
            <div on:click = {offeredCardsClick}>
                <CardMiniStack cards={offeredCards} flipDisabled={true}  />
            </div>
            {#if offeredCards.length > 0}
            <div
                class="absolute top-4 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
            >
                {offeredCards.length}
            </div>
            {/if}
        </div>

        <!-- Carta Richiesta -->
        <div class="relative">
            <div class="text-xs text-gray-400 mb-2">CERCA {askCards.length > 0 ? `(${askCards.length} Carte)` : ''}</div>
            <div on:click = {askCardsClick}>
                <CardMiniStack cards={askCards} />
            </div>

            {#if askCards.length > 0}
                <div
                    class="absolute top-4 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >
                    {askCards.length}
                </div>
            {/if}
        </div>
    </div>

    <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
            <!-- <span
                class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full"
                >HOT</span
            > -->
            {#if completedTrades < 10}
            <span
                class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full"
                >Nuovo utente</span
            >
            {/if}
            {#if new Date(expireTime) - new Date() < 24 * 60 * 60 * 1000 && (new Date(expireTime) - new Date()) > 0}
                <span
                    class="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full"
                    >URGENTE</span
                >
            {/if}
        </div>
        <button
        disabled={(new Date(expireTime) - new Date()) < 0 || cancelled || completed}
        on:click = {acceptTradeClick}
            class="bg-gradient-to-r {(new Date(expireTime) - new Date()) < 0 || cancelled || completed ? "bg-gray-800" : "from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105"}  text-white px-4 py-2 rounded-lg font-semibold transition-all transform"
        >
            {(new Date(expireTime) - new Date()) < 0 ? "Scambio scaduto" : cancelled ? "Scambio cancellato": completed ? "Scambio completato" : textButton}
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
