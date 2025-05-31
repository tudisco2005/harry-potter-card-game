<script>
    export let img_url;
    export let title;
    export let description;
</script>

<div>
    <div class="flex justify-center items-center p-6 hover:translate-z-12">
      <div class="relative w-64 h-96 rounded-3xl border-2 bg-gray-200 border-gray-300 dark:border-gray-400 p-4 dark:bg-gray-800">
        <!-- Image area -->
        <div class="w-full h-56 rounded-xl border border-gray-400 mb-4 overflow-hidden">
          <div class="w-full h-full flex justify-center items-center">
            <!-- L'immagine è contenuta nel box con object-fit: contain -->
            <img 
              src="{img_url}" 
              alt="{title}" 
              class="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
        
        <!-- Name -->
        <div class="border border-gray-400 rounded-lg w-24 p-1 mb-2">
          <span class="text-white">{title}</span>
        </div>
        
        <!-- Description -->
        <div class="text-white text-sm overflow-hidden max-h-16">{description}</div>
        
        <!-- Info icon -->
        <div class="absolute bottom-4 right-4">
          <div class="relative">
            <div class="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-400 flex items-center justify-center">
              <!-- Simple info icon using SVG -->
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
</div>