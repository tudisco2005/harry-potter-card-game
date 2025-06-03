<script>
  export let id = "";
  export let name = "";
  export let alternateNames = [];
  export let species = "";
  export let gender = "";
  export let house = "";
  export let dateOfBirth = "";
  export let yearOfBirth = null;
  export let wizard = false;
  export let ancestry = "";
  export let eyeColour = "";
  export let hairColour = "";
  export let wand = { wood: "", core: "", length: null };
  export let patronus = "";
  export let hogwartsStudent = false;
  export let hogwartsStaff = false;
  export let actor = "";
  export let alternateActors = [];
  export let alive = true;
  export let image = "";

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

  // Funzione per formattare la data
  function formatDate(dateString) {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", 
                   "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  }

  // Funzione per ottenere il primo nome alternativo
  function getPrimaryAlternateName(names) {
    return names && names.length > 0 ? names[0] : "";
  }

  // Funzione per formattare le informazioni della bacchetta
  function formatWandInfo(wandData) {
    if (!wandData || !wandData.wood) return "Bacchetta Sconosciuta";
    const length = wandData.length ? `${wandData.length} cm` : "";
    const core = wandData.core ? `Nucleo: ${wandData.core}` : "";
    return { wood: wandData.wood, length, core };
  }

  // Stato per la rotazione della carta
  let isFlipped = false;

  function flipCard() {
    isFlipped = !isFlipped;
  }

  // Reattive declarations
  $: houseColors = getHouseColors(house);
  $: formattedDate = formatDate(dateOfBirth);
  $: primaryAlternateName = getPrimaryAlternateName(alternateNames);
  $: wandInfo = formatWandInfo(wand);
  $: isAlive = alive;
</script>

<div class="relative w-80 h-[460px] mx-auto" style="perspective: 1000px;">
  <!-- Container della carta con flip -->
  <button 
    class="relative w-full h-full transition-all duration-700 cursor-pointer card-flip-container"
    style="transform-style: preserve-3d; transform: {isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};"
    on:click={flipCard}
  >
    
    <!-- LATO FRONTALE -->
    <div class="absolute inset-0 w-full h-full card-face card-front rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 border-4 {houseColors.border}" style="box-shadow: 0 25px 50px rgba(0,0,0,0.4), 0 0 30px rgba(212, 175, 55, 0.3);">
      

      <!-- Header con nome -->
      <div class="relative bg-gradient-to-r {houseColors.primary} p-4 text-center overflow-hidden">
        <!-- Effetto shimmer -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-pulse"></div>
        
        <h1 class="text-2xl font-bold {houseColors.text} tracking-wide drop-shadow-lg relative z-10">
          {name}
        </h1>
        {#if primaryAlternateName}
          <p class="text-sm text-yellow-200 italic mt-1 opacity-90 relative z-10">
            {primaryAlternateName}
          </p>
        {/if}
      </div>

      <!-- Immagine del personaggio -->
      <div class="relative h-44 overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900">
        {#if image}
          <img 
            src={image} 
            alt={name}
            class="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
          />
        {:else}
          <div class="w-full h-full bg-gray-700 flex items-center justify-center">
            <span class="text-gray-400 text-sm">Immagine non disponibile</span>
          </div>
        {/if}
        
        <!-- Badge della casa -->
        {#if house == "" || house}
          <div class="absolute top-3 right-3 {houseColors.secondary} {houseColors.text} px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg border {houseColors.border}">
            {house == "" ? "?" : house}
          </div>
        {/if}
      </div>

      <!-- Statistiche principali (FRONTALE) -->
      <div class="p-4 bg-gradient-to-b from-amber-900 to-amber-800 flex-1 flex flex-col justify-between">
        
        <!-- Informazioni base -->
        <div class="space-y-3">
          <div class="flex justify-between items-center pb-2 pt-1 border-b border-yellow-400/30">
            <span class="text-sm text-yellow-400 font-semibold uppercase tracking-wide">Specie</span>
            <span class="text-sm text-amber-100 capitalize font-medium">{species == "" ? "?" : species}</span>
          </div>

          {#if formattedDate == "" || formattedDate}
            <div class="flex justify-between items-center py-2 border-b border-yellow-400/30">
              <span class="text-sm text-yellow-400 font-semibold uppercase tracking-wide">Data di Nascita</span>
              <span class="text-sm text-amber-100 font-medium">{formattedDate == "" ? "?" : formattedDate}</span>
            </div>
          {/if}

          {#if ancestry == "" || ancestry}
            <div class="flex justify-between items-center py-2 border-b border-yellow-400/30">
              <span class="text-sm text-yellow-400 font-semibold uppercase tracking-wide">Sangue</span>
              <span class="text-sm text-amber-100 capitalize font-medium">{ancestry == "" ? "?" : ancestry}</span>
            </div>
          {/if}

          {#if gender == "" || gender}
            <div class="flex justify-between items-center border-b py-2 border-yellow-400/30">
              <span class="text-sm text-yellow-400 font-semibold uppercase tracking-wide">Genere</span>
              <span class="text-sm text-amber-100 capitalize font-medium">{gender == "" ? "?" :  gender}</span>
            </div>
          {/if}
        </div>
        
      </div>
    </div>

    <!-- LATO POSTERIORE -->
    <div class="absolute inset-0 w-full h-full card-face card-back rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 border-4 {houseColors.border}" style="box-shadow: 0 25px 50px rgba(0,0,0,0.4), 0 0 30px rgba(212, 175, 55, 0.3);">
      
      <div class="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-red-800 font-bold text-lg shadow-lg z-10 animate-pulse">
        ★
      </div>

      <!-- Header con nome -->
      <div class="relative bg-gradient-to-r {houseColors.primary} p-4 text-center overflow-hidden">
        <h1 class="text-2xl font-bold {houseColors.text} tracking-wide drop-shadow-lg relative z-10">
          {name}
        </h1>
      </div>

      <!-- Statistiche complete (POSTERIORE) -->
      <div class="p-5 bg-gradient-to-b from-amber-900 to-amber-800 flex-1 space-y-3 overflow-y-auto">
        
        <!-- Informazioni bacchetta -->
        {#if wandInfo.wood && wandInfo.wood !== "Bacchetta Sconosciuta"}
          <div class="bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/30">
            <div class="text-xs text-yellow-400 font-semibold uppercase text-center mb-2 tracking-wide">
              Bacchetta Magica
            </div>
            <div class="text-sm text-amber-100 text-center leading-relaxed space-y-1">
              <div class="capitalize font-medium">{wandInfo.wood}</div>
              {#if wandInfo.length}
                <div class="text-xs">{wandInfo.length}</div>
              {/if}
              {#if wandInfo.core}
                <div class="text-xs opacity-80">{wandInfo.core}</div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Patronus -->
        {#if patronus}
          <div class="text-center p-3 bg-red-800/20 rounded-lg border border-yellow-400/30">
            <div class="text-xs text-yellow-400 font-semibold uppercase mb-2 tracking-wide">
              Patronus
            </div>
            <div class="text-sm text-yellow-300 font-semibold capitalize flex items-center justify-center gap-2">
              {#if patronus === 'stag'}
                🦌
              {:else if patronus === 'doe'}
                🦌
              {:else if patronus === 'otter'}
                🦦
              {:else if patronus === 'hare'}
                🐰
              {:else if patronus === 'goat'}
                🐐
              {:else}
                ✨
              {/if}
              <span>{patronus}</span>
            </div>
          </div>
        {/if}

        <!-- Dettagli fisici -->
        <div class="bg-purple-900/20 rounded-lg p-3 border border-yellow-400/30">
          <div class="text-xs text-yellow-400 font-semibold uppercase text-center mb-2 tracking-wide">
            Caratteristiche
          </div>
          <div class="space-y-1">
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
            {#if actor}
              <div class="flex justify-between text-xs">
                <span class="text-yellow-400">Attore:</span>
                <span class="text-amber-100">{actor}</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Nomi alternativi -->
        {#if alternateNames.length > 1}
          <div class="bg-blue-900/20 rounded-lg p-3 border border-yellow-400/30">
            <div class="text-xs text-yellow-400 font-semibold uppercase text-center mb-2 tracking-wide">
              Altri Nomi
            </div>
            <div class="space-y-1">
              {#each alternateNames.slice(1) as altName}
                <div class="text-xs text-amber-100 italic text-center opacity-90">"{altName}"</div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Status -->
        <div class="flex justify-between items-center pt-3 border-t border-yellow-400/30">
          <div class="flex gap-1 flex-wrap">
            {#if wizard}
              <span class="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Mago</span>
            {/if}
            {#if hogwartsStudent}
              <span class="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Studente</span>
            {/if}
            {#if hogwartsStaff}
              <span class="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Staff</span>
            {/if}
          </div>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full {isAlive ? 'bg-green-400' : 'bg-red-400'}"></div>
            <span class="text-xs text-amber-200">{isAlive ? 'Vivo' : 'Morto'}</span>
          </div>
        </div>

        <!-- Indicatore per tornare indietro -->
        <div class="text-center pt-3">
          <span class="text-xs text-yellow-300 animate-pulse">✨ Clicca per tornare ✨</span>
        </div>
      </div>
    </div>
  </button>
</div>

<style>
  @keyframes float {
    0%, 100% { 
      opacity: 0; 
      transform: translateY(0px) translateX(0px) scale(0);
    }
    50% { 
      opacity: 1; 
      transform: translateY(-20px) translateX(10px) scale(1);
    }
  }

  .animate-float {
    animation: float 4s infinite ease-in-out;
  }

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