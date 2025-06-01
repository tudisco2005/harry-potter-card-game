<script>
    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();
</script>

<section class="bg-gray-50 dark:bg-gray-900 w-10/12 sm:w-3/12">
    <div class="w-full px-2 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:max-w-2xl xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Accedi al tuo account
            </h1>
            <form class="space-y-4 md:space-y-6" action="/api/user/login">
                <div class="md:col-span-2">
                    <label for="email/username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Indirizzo Email o Username</label>
                    <input type="email/username" name="email/username" id="email/username" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com or username" required="">
                </div>
                <div>
                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="">
                </div>
                <button type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Accedi</button>
            </form>
        </div>
    </div>
</section>