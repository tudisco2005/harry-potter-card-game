<script>

  import CharacterCardMini from './CharacterCardMini.svelte';
  export let cards = [];
  export let flipDisabled = false;

  // Calcoliamo un punto centrale per la rotazione, così il mazzo appare bilanciato
  const centerIndex = (cards.length - 1) / 2;
</script>

<div
  class="w-full min-h-50 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 rounded-xl border-2 border-yellow-400 shadow-xl flex justify-center items-center overflow-hidden p-8"
>
  <div class="relative w-40 h-42 flex justify-center items-center">
    
    {#each cards as card, i}
      <div
        class="absolute transition-all duration-300 ease-in-out hover:!rotate-0 hover:z-50"
        style="
          z-index: {i};
          transform: rotate({(i - centerIndex) * 6}deg) translateY({Math.abs(i - centerIndex) * -4}px);
        "
      >
        <CharacterCardMini {...card} flipDisabled />
      </div>
    {/each}

  </div>
</div>