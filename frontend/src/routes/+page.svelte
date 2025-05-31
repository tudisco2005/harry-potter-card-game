<script>
    import Card from './../components/Card.svelte';
</script>

<section class="bg-white dark:bg-gray-900">
    <div class="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
        <div class="mr-auto place-self-center lg:col-span-7">
            <h1 class="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">
                Comincia subito la tua collezione
            </h1>
            <p class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
                Scopri, colleziona e completa l'intera collezione di supereroi Marvel prima di chiunque altro!
            </p>
            <a href="#" class="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                Comincia ora
                <svg class="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </a>
            <a href="https://github.com/Bremlox/progetto-web-e-mobile-uni" class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                <p>Codice</p>
                <svg class="w-5 h-5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14"/>
                </svg>               
            </a> 
        </div>
        <div class="lg:mt-0 lg:col-span-5 lg:flex perspective-normal mr-4 lg:mr-0 md:ml-10">
            <div class="relative h-[28rem] w-72 mx-auto lg:mx-0">
              <!-- Terza carta (in cima) -->
              <div class="absolute transform rotate-[-8deg] translate-x-2 translate-y-4 z-10">
                <Card img_url="images.jpg" title="" description=""></Card>
              </div>
              
              <!-- Seconda carta (in mezzo) -->
              <div class="absolute transform rotate-[-4deg] translate-x-1 translate-y-2 z-20">
                <Card img_url="images.jpg" title="" description=""></Card>
              </div>

              <!-- Prima carta (in fondo) -->
              <div class="absolute z-30 translate-x-0.5">
                <Card img_url="images.jpg" title="Iron Man" description="Genio, miliardario, playboy, filantropo."></Card>
              </div>
            </div>
          </div>              
    </div>
</section>