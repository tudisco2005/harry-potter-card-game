<script>
    // Importa le funzionalità di navigazione e il componente della carta
    import { goto } from '$app/navigation';
	import CharacterCard from '../components/CharacterCard.svelte';

  // Riceve i dati dal server sveltekit
  let { data } = $props();

  // Dati di esempio per la carta di Harry Potter
  // Questi dati vengono utilizzati per mostrare un esempio di carta nella homepage
  const harryData = {
    "id": "9e3f7ce4-b9a7-4244-b709-dae5c1f1d4a8",
    "name": "Harry Potter",
    "alternate_names": [
      "The Boy Who Lived",
      "The Chosen One",
      "Undesirable No. 1",
      "Potty"
    ],
    "species": "human",
    "gender": "male",
    "house": "Gryffindor",
    "dateOfBirth": "31-07-1980",
    "yearOfBirth": 1980,
    "wizard": true,
    "ancestry": "half-blood",
    "eyeColour": "green",
    "hairColour": "black",
    "wand": {
      "wood": "holly",
      "core": "phoenix tail feather",
      "length": 11
    },
    "patronus": "stag",
    "hogwartsStudent": true,
    "hogwartsStaff": false,
    "actor": "Daniel Radcliffe",
    "alternate_actors": [],
    "alive": true,
    "image": "https://ik.imagekit.io/hpapi/harry.jpg"
  };

  // Gestisce il click sul pulsante di registrazione/gioco
  // Se l'utente è autenticato, lo porta all'album, altrimenti alla pagina di registrazione
  function handleHomeRegister() {
    if(data.user.isAuthenticated) goto("/album")
    else goto("/register")
  }
</script>

<section class="bg-white dark:bg-gray-900 flex items-center w-full pb-8">
  <div class="container mx-auto px-4 max-w-7xl">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">

      <!-- Sezione del testo introduttivo -->
      <div class="flex-1 text-center lg:text-left w-full lg:w-auto max-w-2xl lg:max-w-none order-1 lg:order-1">
        <h1 class="mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight dark:text-white">
          Comincia subito la tua
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">
            collezione
          </span>
        </h1>
        <p class="mb-6 lg:mb-8 font-light text-gray-500 text-base sm:text-lg lg:text-xl dark:text-gray-400 leading-relaxed">
          Scopri, colleziona e completa l'intera collezione dei personaggi di Hogwarts prima di chiunque altro!
        </p>

        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
          <!-- Pulsante principale per registrazione/gioco -->
          <a on:click={handleHomeRegister} class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-center text-white rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            {data.user.isAuthenticated ? "Gioca" : "Registrati ora"}
            <svg class="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </a>
          <!-- Pulsante secondario per il codice GitHub -->
          <a href="https://github.com/tudisco2005/harry-potter-card-game"
            class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800 transition-all duration-300">
            <span>Codice</span>
            <svg class="w-5 h-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Sezione delle carte impilate con effetto 3D -->
      <div class="order-2 relative md:scale-98 lg:scale-100">
        <div class="relative w-fit mx-auto">
                    <!-- Effetto di luminosità di sfondo -->
          <div class="absolute inset-0 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-full blur-3xl scale-110 lg:scale-125 -z-10 opacity-50"></div> 

          <!-- Carta di sfondo con rotazione e scala -->
          <div class="absolute top-0 left-0 transform -rotate-12 translate-y-2 opacity-95 scale-95">
            <CharacterCard quantity={1} content={harryData} />
          </div>
          
          <!-- Carta intermedia con rotazione e scala -->
          <div class="absolute top-0 left-0 transform -rotate-6 opacity-85 scale-98">
            <CharacterCard quantity={1} content={harryData} />
          </div>
          
          <!-- Carta in primo piano con effetto hover -->
          <div class="relative z-10 transform hover:scale-105 transition-transform duration-300 ">
            <CharacterCard quantity={1} content={harryData} />
          </div>
        </div>
      </div>      
    </div>
  </div>
</section>

<style>
  .scale-98 {
    transform: scale(0.98);
  }
  .scale-95 {
    transform: scale(0.95);
  }
</style>