<script>
  export let name = "";
  export let alternateNames = [];
  export let species = "";
  export let gender = "";
  export let house = "";
  export let dateOfBirth = "";
  export let wizard = false;
  export let ancestry = "";
  export let eyeColour = "";
  export let hairColour = "";
  export let wand = { wood: "", core: "", length: null };
  export let patronus = "";
  export let hogwartsStudent = false;
  export let hogwartsStaff = false;
  export let actor = "";
  export let alive = true;
  export let image = "";
  export let flipDisabled = false;

  // Funzione per ottenere i colori della casa
  function getHouseColors(houseName) {
    const houses = {
      "Gryffindor": {
        primary: "from-red-800 to-red-600",
        secondary: "bg-red-700",
        text: "text-yellow-400",
        border: "border-yellow-400"
      },
      "Slytherin": {
        primary: "from-green-800 to-green-600", 
        secondary: "bg-green-700",
        text: "text-gray-300",
        border: "border-gray-300"
      },
      "Ravenclaw": {
        primary: "from-blue-800 to-blue-600",
        secondary: "bg-blue-700", 
        text: "text-yellow-400",
        border: "border-yellow-400"
      },
      "Hufflepuff": {
        primary: "from-yellow-700 to-yellow-500",
        secondary: "bg-yellow-600",
        text: "text-gray-900",
        border: "border-gray-900"
      }
    };
    return houses[houseName] || houses["Gryffindor"];
  }

  // Funzione per ottenere il primo nome alternativo
  function getPrimaryAlternateName(names) {
    return names && names.length > 0 ? names[0] : "";
  }

  // Funzione per formattare le informazioni della bacchetta
  function formatWandInfo(wandData) {
    if (!wandData || !wandData.wood) return "Sconosciuta";
    const length = wandData.length ? ` (${wandData.length}cm)` : "";
    return `${wandData.wood}${length}`;
  }

  // Stato per la rotazione della carta
  let isFlipped = false;

  function flipCard() {
    if(flipDisabled) return;
    isFlipped = !isFlipped;
  }

  // Reattive declarations
  $: houseColors = getHouseColors(house);
  $: primaryAlternateName = getPrimaryAlternateName(alternateNames);
  $: wandInfo = formatWandInfo(wand);
  $: isAlive = alive;
</script>

<div class="relative w-36 h-44 mx-auto" style="perspective: 1000px;">
  <!-- Container della carta con flip -->
  <button 
    class="relative w-full h-full transition-all duration-500 cursor-pointer card-flip-container"
    style="transform-style: preserve-3d; transform: {isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};"
    on:click={flipCard}
  >
    
    <!-- LATO FRONTALE -->
    <div class="absolute inset-0 w-full h-full card-face card-front rounded-lg overflow-hidden shadow-lg bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 border-2 {houseColors.border}">
      
      <!-- Header con nome -->
      <div class="relative bg-gradient-to-r {houseColors.primary} p-2 text-center">
        <h1 class="text-xs font-bold {houseColors.text} tracking-wide truncate">
          {name}
        </h1>
        {#if primaryAlternateName}
          <p class="text-xs text-yellow-200 italic opacity-90 truncate">
            {primaryAlternateName}
          </p>
        {/if}
      </div>

      <!-- Immagine del personaggio -->
      <div class="relative h-16 overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900">
        {#if image}
          <img 
            src={image} 
            alt={name}
            class="w-full h-full object-cover"
          />
        {:else}
          <div class="w-full h-full bg-gray-700 flex items-center justify-center">
            <span class="text-gray-400 text-xs">No img</span>
          </div>
        {/if}
        
        <!-- Badge della casa -->
        {#if house}
          <div class="absolute top-1 right-1 {houseColors.secondary} {houseColors.text} px-1 py-0.5 rounded text-xs font-semibold">
            {house.charAt(0)}
          </div>
        {/if}
      </div>

      <!-- Informazioni base compatte -->
      <div class="p-1.5 bg-gradient-to-b from-amber-900 to-amber-800 flex-1 space-y-1 text-xs">
        
        <div class="flex justify-between">
          <span class="text-yellow-400 font-semibold text-xs">Specie:</span>
          <span class="text-amber-100 capitalize truncate ml-1 text-xs">{species || "?"}</span>
        </div>

        {#if ancestry}
          <div class="flex justify-between">
            <span class="text-yellow-400 font-semibold text-xs">Sangue:</span>
            <span class="text-amber-100 capitalize truncate ml-1 text-xs">{ancestry}</span>
          </div>
        {/if}

        <!-- Status badges compatti -->
        <div class="flex justify-between items-center pt-1 border-t border-yellow-400/30">
          <div class="flex gap-1">
            {#if wizard}<span class="w-1.5 h-1.5 bg-purple-500 rounded-full" title="Mago"></span>{/if}
            {#if hogwartsStudent}<span class="w-1.5 h-1.5 bg-blue-500 rounded-full" title="Studente"></span>{/if}
            {#if hogwartsStaff}<span class="w-1.5 h-1.5 bg-green-500 rounded-full" title="Staff"></span>{/if}
          </div>
          <div class="flex items-center gap-1">
            <div class="w-1 h-1 rounded-full {isAlive ? 'bg-green-400' : 'bg-red-400'}"></div>
            <span class="text-xs text-amber-200">{isAlive ? 'Vivo' : 'Morto'}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LATO POSTERIORE -->
    <div class="absolute inset-0 w-full h-full card-face card-back rounded-lg overflow-hidden shadow-lg bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 border-2 {houseColors.border}">
      
      <!-- Header -->
      <div class="relative bg-gradient-to-r {houseColors.primary} p-2 text-center">
        <h1 class="text-xs font-bold {houseColors.text} tracking-wide truncate">
          {name}
        </h1>
      </div>

      <!-- Dettagli completi -->
      <div class="p-1.5 bg-gradient-to-b from-amber-900 to-amber-800 flex-1 space-y-1.5 overflow-y-auto text-xs">
        
        <!-- Bacchetta -->
         {#if actor}
          <div class="bg-blue-900/20 rounded p-1.5 border border-yellow-400/30 text-center">
            <div class="text-yellow-400 font-semibold mb-0.5 text-xs">Attore</div>
            <div class="text-amber-100 text-xs">{actor}</div>
          </div>
        {/if}
        {#if wand.wood}
          <div class="bg-yellow-400/10 rounded p-1.5 border border-yellow-400/30">
            <div class="text-yellow-400 font-semibold text-center mb-0.5 text-xs">Bacchetta</div>
            <div class="text-amber-100 text-center text-xs">
              <div class="capitalize">{wandInfo}</div>
            </div>
          </div>
        {/if}


        <!-- Caratteristiche fisiche -->
        <!-- <div class="bg-purple-900/20 rounded p-1.5 border border-yellow-400/30">
          <div class="text-yellow-400 font-semibold text-center mb-0.5 text-xs">Aspetto</div>
          <div class="space-y-0.5">
            {#if eyeColour}
              <div class="flex justify-between text-xs">
                <span class="text-yellow-400">Occhi:</span>
                <span class="text-amber-100 capitalize">{eyeColour}</span>
              </div>
            {/if}
            {#if hairColour}
              <div class="flex justify-between text-xs">
                <span class="text-yellow-400">Capelli:</span>
                <span class="text-amber-100 capitalize">{hairColour}</span>
              </div>
            {/if}
          </div>
        </div> -->
        
        <!-- Indicatore per tornare indietro -->
        <div class="text-center pt-0.5">
          <span class="text-xs text-yellow-300 opacity-70">← Indietro</span>
        </div>
      </div>
    </div>
  </button>
</div>

<style>
  .card-flip-container {
    transform-style: preserve-3d;
  }

  .card-face {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .card-back {
    transform: rotateY(180deg);
  }

  .card-front {
    transform: rotateY(0deg);
  }
</style>