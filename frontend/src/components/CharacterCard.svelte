<script>
    import CharacterCardContent from "./CharacterCardContent.svelte";

    export let flipDisabled = false;
    export let content;
    export let quantity = 1;
    export let requested = false;


</script>

<div
    class:grayscale={!requested && quantity == 0}
    class="relative {quantity == 0
        ? 'opacity-50 '
        : ''}"
>
    {#if quantity == 0 || requested}
        <!-- Tag che copre sicuramente tutta la diagonale -->
        <div class="absolute inset-0 z-10 pointer-events-none">
            <div
                class="absolute rounded-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-lg font-bold w-80 h-12 flex items-center justify-center transform rotate-45 shadow-xl"
            >
                {requested ? 'Richiesta gia in corso...' : 'MANCANTE'}
            </div>
        </div>
    {:else if quantity > 1}
        <!-- Contatore in alto a destra -->
        <div class="absolute top-2 right-2 z-20 pointer-events-none">
            <div class="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[24px] h-6 flex items-center justify-center shadow-lg border-2 border-white">
                {quantity > 100 ? 'x99+' : `x${quantity}`}
            </div>
        </div>
    {/if}
    <CharacterCardContent {...content} flipDisabled={flipDisabled}/>
</div>

