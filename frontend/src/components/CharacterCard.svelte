<script>
    // Importa il componente per il contenuto della carta
    import CharacterCardContent from "./CharacterCardContent.svelte";

    // Props del componente
    export let flipDisabled = false;  // Disabilita il ribaltamento della carta
    export let content;               // Contenuto della carta
    export let quantity = 1;          // Quantità di carte possedute
    export let requested = false;     // Indica se la carta è stata richiesta in uno scambio
</script>

<!-- 
    Contenitore principale della carta
    Applica effetti visivi in base allo stato della carta
-->
<div
    class:grayscale={!requested && quantity == 0} 
    class="relative {quantity == 0
        ? 'opacity-50 '  // Riduce l'opacità se non posseduta
        : ''}"
>
    {#if quantity == 0 || requested}
        <!-- 
            Tag diagonale che indica lo stato della carta
            Appare quando la carta non è posseduta o è già richiesta
        -->
        <div class="absolute inset-0 z-10 pointer-events-none">
            <div
                class="absolute rounded-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-lg font-bold w-80 h-12 flex items-center justify-center transform rotate-45 shadow-xl"
            >
                {requested ? 'Richiesta gia in corso...' : 'MANCANTE'}
            </div>
        </div>
    {:else if quantity > 1}
        <!-- 
            Contatore delle carte possedute
            Appare in alto a destra quando si possiedono più copie
        -->
        <div class="absolute top-2 right-2 z-20 pointer-events-none">
            <div class="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[24px] h-6 flex items-center justify-center shadow-lg border-2 border-white">
                {quantity > 100 ? 'x99+' : `x${quantity}`}
            </div>
        </div>
    {/if}
    <!-- Renderizza il contenuto della carta -->
    <CharacterCardContent {...content} flipDisabled={flipDisabled}/>
</div>

