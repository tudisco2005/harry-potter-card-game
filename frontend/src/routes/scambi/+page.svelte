<script>
    import CharacterCard from './../../components/CharacterCard.svelte';
</script>


<div class="w-full sm:w-full ">

    <!-- Hero Section -->
    <section class="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div class="text-center mb-12">
            <h2 class="text-5xl md:text-6xl font-bold text-white mb-4">
                Scambi <span class="gradient-text">Disponibili</span>
            </h2>
            <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Scopri migliaia di offerte di scambio da tutti i giocatori. Trova la carta perfetta per completare la tua collezione.
            </p>
        </div>

        <!-- Filtri e Ricerca -->
        <div class="glass-effect rounded-2xl p-6 mt-2 mb-8">
            <div class="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Cerca carte</label>
                    <div class="relative">
                        <input type="text" placeholder="Nome carta..." class="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none">
                        <span class="absolute right-3 top-3 text-gray-400">🔍</span>
                    </div>
                </div>
                
                
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Ordina per</label>
                    <select class="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-yellow-400 focus:outline-none">
                        <option>Più recenti</option>
                        <option>Valore crescente</option>
                        <option>Valore decrescente</option>
                        <option>Scadenza</option>
                    </select>
                </div>
            </div>
            
            <div class="flex flex-wrap gap-2">
                <span class="text-sm text-gray-300">Filtri rapidi:</span>
                <button class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors">
                    Tutti
                </button>
                <button class="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                    Carte Mancanti
                </button>
                <button class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30 hover:bg-green-500/30 transition-colors">
                    Più di 2 carte
                </button>
            </div>
        </div>

        
    </section>

    <!-- Lista Scambi -->
    <section class="relative z-10 max-w-7xl mx-auto px-4 pb-20">
        <div class="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            <!-- Scambio 1 - Leggendario -->
            <div class="trade-card rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-sm">AK</span>
                        </div>
                        <div>
                            <div class="text-white font-semibold">Alex Knight</div>
                            <div class="text-sm text-gray-400">⭐ 4.9 (156 scambi)</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-400">Scade tra</div>
                        <div class="text-sm text-yellow-400 font-semibold">2 giorni</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <!-- Carta Offerta -->
                    <div class="relative">
                        <div class="text-xs text-gray-400 mb-2">OFFRE</div>
                        <div class="w-full h-40 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 rounded-xl border-2 border-yellow-400 shadow-xl relative overflow-hidden">
                            <div class="my-2">
                                <CharacterCard />
                            </div>
                        </div>
                    </div>

                    <!-- Carta Richiesta -->
                    <div class="relative">
                        <div class="text-xs text-gray-400 mb-2">CERCA</div>
                        <div class="w-full h-40 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 rounded-xl border-2 border-blue-400 shadow-xl relative overflow-hidden">
                            <div class="my-2">
                                <CharacterCard />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">+€50 conguaglio</span>
                        <span class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">HOT</span>
                    </div>
                    <button class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105">
                        Accetta Scambio
                    </button>
                </div>
            </div>

            <!-- Scambio 2 - Epico -->
            <div class="trade-card rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-sm">LM</span>
                        </div>
                        <div>
                            <div class="text-white font-semibold">Luna Magic</div>
                            <div class="text-sm text-gray-400">⭐ 4.7 (89 scambi)</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-400">Scade tra</div>
                        <div class="text-sm text-red-400 font-semibold">8 ore</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="relative">
                        <div class="text-xs text-gray-400 mb-2">OFFRE</div>
                        <div class="card-3d w-full h-40 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 rounded-xl border-2 border-purple-400 shadow-xl relative overflow-hidden">
                            <div class="rarity-epic absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse"></div>
                            <div class="p-3">
                                <div class="text-purple-400 font-bold text-xs mb-1">Blue-Eyes</div>
                                <div class="text-purple-200 text-xs">LOB 1st Edition</div>
                                <div class="absolute bottom-2 left-2 text-xs text-purple-300">★★★★☆</div>
                            </div>
                            <div class="absolute bottom-2 right-2 text-xs text-purple-300 font-bold">€320</div>
                        </div>
                    </div>

                    <div class="relative">
                        <div class="text-xs text-gray-400 mb-2">CERCA</div>
                        <div class="w-full h-40 bg-gradient-to-b from-red-900 via-red-800 to-red-900 rounded-xl border-2 border-red-400 shadow-xl relative overflow-hidden">
                            <div class="rarity-epic absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse"></div>
                            <div class="p-3">
                                <div class="text-red-400 font-bold text-xs mb-1">Pikachu</div>
                                <div class="text-red-200 text-xs">Promo 1998</div>
                                <div class="absolute bottom-2 left-2 text-xs text-red-300">★★★★☆</div>
                            </div>
                            <div class="absolute bottom-2 right-2 text-xs text-red-300 font-bold">€280</div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Scambio equo</span>
                        <span class="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">URGENTE</span>
                    </div>
                    <button class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105">
                        Accetta Scambio
                    </button>
                </div>
            </div>

            <!-- Scambio 3 - Raro -->
            <div class="trade-card rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-sm">TC</span>
                        </div>
                        <div>
                            <div class="text-white font-semibold">Tom Collector</div>
                            <div class="text-sm text-gray-400">⭐ 4.8 (203 scambi)</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-400">Scade tra</div>
                        <div class="text-sm text-yellow-400 font-semibold">5 giorni</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="relative">
                        <div class="text-xs text-gray-400 mb-2">OFFRE</div>
                        <div class="card-3d w-full h-40 bg-gradient-to-b from-green-900 via-green-800 to-green-900 rounded-xl border-2 border-green-400 shadow-xl relative overflow-hidden">
                            <div class="rarity-rare absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse"></div>
                            <div class="p-3">
                                <div class="text-green-400 font-bold text-xs mb-1">Messi</div>
                                <div class="text-green-200 text-xs">Panini 2022</div>
                                <div class="absolute bottom-2 left-2 text-xs text-green-300">★★★☆☆</div>
                            </div>
                            <div class="absolute bottom-2 right-2 text-xs text-green-300 font-bold">€45</div>
                        </div>
                    </div>

                    <div class="relative">
                        <div class="text-xs text-gray-400 mb-2">CERCA</div>
                        <div class="w-full h-40 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 rounded-xl border-2 border-blue-400 shadow-xl relative overflow-hidden">
                            <div class="rarity-rare absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse"></div>
                            <div class="p-3">
                                <div class="text-blue-400 font-bold text-xs mb-1">Ronaldo</div>
                                <div class="text-blue-200 text-xs">Panini 2021</div>
                                <div class="absolute bottom-2 left-2 text-xs text-blue-300">★★★☆☆</div>
                            </div>
                            <div class="absolute bottom-2 right-2 text-xs text-blue-300 font-bold">€50</div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Nuovo utente</span>
                    </div>
                    <button class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105">
                        Accetta Scambio
                    </button>
                </div>
            </div>

            <!-- Scambio 4 - Multiplo -->
            <div class="trade-card rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-sm">SK</span>
                        </div>
                        <div>
                            <div class="text-white font-semibold">Sara King</div>
                            <div class="text-sm text-gray-400">⭐ 4.9 (341 scambi)</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-400">Scade tra</div>
                        <div class="text-sm text-yellow-400 font-semibold">1 giorno</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="relative">
                        <div class="text-xs text-gray-400 mb-2">OFFRE (3 carte)</div>
                        <div class="relative">
                            <div class="card-3d w-full h-40 bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 rounded-xl border-2 border-gray-400 shadow-xl relative overflow-hidden">
                                <div class="rarity-common absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse"></div>
                                <div class="p-3">
                                    <div class="text-gray-300 font-bold text-xs mb-1">Set Comuni</div>
                                    <div class="text-gray-400 text-xs">Varie collezioni</div>
                                    <div class="absolute bottom-2 left-2 text-xs text-gray-400">★★☆☆☆</div>
                                </div>
                                <div class="absolute bottom-2 right-2 text-xs text-gray-400 font-bold">€25</div>
                            </div>
                            <div class="absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                        </div>
                    </div>

                    <div class="relative">
                        <div class="text-xs text-gray-400 mb-2">CERCA</div>
                        <div class="w-full h-40 bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 rounded-xl border-2 border-indigo-400 shadow-xl relative overflow-hidden">
                            <div class="rarity-rare absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse"></div>
                            <div class="p-3">
                                <div class="text-indigo-400 font-bold text-xs mb-1">Jace</div>
                                <div class="text-indigo-200 text-xs">Mind Sculptor</div>
                                <div class="absolute bottom-2 left-2 text-xs text-indigo-300">★★★★☆</div>
                            </div>
                            <div class="absolute bottom-2 right-2 text-xs text-indigo-300 font-bold">€30</div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">Multiplo</span>
                        <span class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">VIP</span>
                    </div>
                    <button class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105">
                        Accetta Scambio
                    </button>
                </div>
            </div>
        </div>
    </section>
</div>

<style>
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(1deg); }
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
            50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
        }
        
        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        .animate-float {
            animation: float 4s ease-in-out infinite;
        }
        
        .animate-shimmer {
            animation: shimmer 2s infinite;
        }
        
        .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-sparkle {
            animation: sparkle 2s ease-in-out infinite;
        }
        
        .card-3d {
            transform-style: preserve-3d;
            transition: all 0.4s ease;
        }
        
        .card-3d:hover {
            transform: translateY(-8px) rotateX(5deg) rotateY(5deg);
        }
        
        .gradient-text {
            background: linear-gradient(45deg, #f59e0b, #eab308, #f97316);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .rarity-legendary {
            background: linear-gradient(45deg, #fbbf24, #f59e0b, #d97706);
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
        }
        
        .rarity-epic {
            background: linear-gradient(45deg, #a855f7, #7c3aed, #6d28d9);
            box-shadow: 0 0 25px rgba(168, 85, 247, 0.4);
        }
        
        .rarity-rare {
            background: linear-gradient(45deg, #3b82f6, #2563eb, #1d4ed8);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }
        
        .rarity-common {
            background: linear-gradient(45deg, #6b7280, #4b5563, #374151);
            box-shadow: 0 0 15px rgba(107, 114, 128, 0.3);
        }
        
        .trade-card {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
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