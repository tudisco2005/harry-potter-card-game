import { hashPassword, verifyPassword } from '../auth/crypto.js';
import { userModel } from '../models/user.js';
import { tradeModel } from '../models/trade.js';
import blacklistModel from '../models/blacklist.js';
import { generateToken, verifyToken } from '../auth/auth.js';
import { generateRandomCards } from '../utils/utils.js';

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     tags:
 *       - Utente
 *     summary: Registra un nuovo utente
 *     description: Crea un nuovo account utente con username, email, password e mago preferito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - favouriteWizard
 *               - password
 *               - confirmPassword
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome utente (non può contenere @)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email dell'utente
 *               favouriteWizard:
 *                 type: string
 *                 description: Mago preferito dell'utente
 *               password:
 *                 type: string
 *                 description: Password (min 8 caratteri, 1 maiuscola, 1 minuscola, 1 numero)
 *               confirmPassword:
 *                 type: string
 *                 description: Conferma password
 *     responses:
 *       201:
 *         description: Utente registrato con successo
 *       400:
 *         description: Dati non validi o mancanti
 *       500:
 *         description: Errore del server
 */
export const createUserController = (mongodb) => {
    return async function registerUser(req, res) {
        const { username, email, favouriteWizard, password, confirmPassword } = req.body;

        // Validate input
        // - check if fields are not empty
        if (!username || !email || !favouriteWizard || !password || !confirmPassword) {
            console.log("[-] Registrazione fallita: Campi mancanti nella registrazione");
            return res.status(400).send({ message: "Non sono presenti tutti i campi" });
        }

        // check if username contains @
        if (username.includes("@")) {
            console.log("[-] Registrazione fallita: Il nome utente non può contenere '@'");
            return res.status(400).send({ message: "Il nome utente non può contenere '@'" });
        }

        // - check password rules(min 8, 1 uppercase, 1 lowercase, 1 number)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            console.log("[-] Registrazione fallita: Password non valida");
            return res.status(400).send({ message: "La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero" });
        }

        // - if passwords are the same
        if (password != confirmPassword) {
            console.log("[-] Registrazione fallita: Le password non corrispondono");
            return res.status(400).send({ message: "Le password non corrispondono" });
        }

        //check if username already exists
        const existingUser = await userModel.findOne({ username }).catch((error) => {
            console.error("[-] Errore durante la ricerca dell'utente:", error);
            return res.status(500).send({ message: "Errore Server" });
        });
        if (existingUser) {
            console.log("[-] Registrazione fallita: Nome utente già esistente");
            return res.status(400).send({ message: "Nome utente già esistente" });
        }

        //check if email already exists
        const existingEmail = await userModel.findOne({ email }).catch((error) => {
            console.error("[-] Errore durante la ricerca dell'email:", error);
            return res.status(500).send({ message: "Errore Server" });
        });
        if (existingEmail) {
            console.log("[-] Registrazione fallita: Email già esistente");
            return res.status(400).send({ message: "Email già esistente" });
        }

        //hash password using argon
        const hash = await hashPassword(password).catch((error) => {
            console.log("[-] Errore durante l'hashing della password:", error);
            return res.status(500).send({ message: "Errore Server" });
        });

        // set all cards to quantity 0
        // fetch card from https://hp-api.onrender.com/api/characters
        const response = await fetch('https://hp-api.onrender.com/api/characters');
        const cards = await response.json();
        const game_cards = cards.map(card => ({
            ...card,
            quantity: 0
        }));

        // starting balance
        const startingBalance = 5; // Starting balance for new users

        try {
            await userModel.create({
                username,
                email,
                favouriteWizard,
                password: hash,
                game_cards,
                balance: startingBalance
            });

            // Log user registration details
            console.log("[+] Registrazione nuovo utente:", { username, email, favouriteWizard });

            // Send success response
            res.status(201).send({ message: "Registrazione con successo" });
        } catch (error) {
            console.error("[-] Errore durante la registrazione:", error);
            res.status(500).send({ message: "Errore durante la registrazione" });
        }
    }
};

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     tags:
 *       - Utente
 *     summary: Login utente
 *     description: Autentica un utente esistente con username/email e password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username o email dell'utente
 *               password:
 *                 type: string
 *                 description: Password dell'utente
 *     responses:
 *       200:
 *         description: Login effettuato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Dati mancanti
 *       401:
 *         description: Credenziali non valide
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore del server
 */
export const loginUserController = (mongodb) => {
    return async function loginUser(req, res) {
        const { username, password } = req.body;

        console.log("[-] Login in corso:", { username, password });

        // Validate input
        if (!username || !password) {
            console.log("[-] Login fallito: Campi mancanti nella registrazione");
            return res.status(400).send({ message: "Non sono presenti tutti i campi" });
        }

        // check if is a username or email
        const isEmail = username.includes("@");
        let query = isEmail ? { email: username } : { username: username };

        try {
            const user = await userModel.findOne(query).catch((error) => {
                console.error("[-] Errore durante la ricerca dell'utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (!user) {
                console.log("[-] Login fallito: Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            const isPasswordValid = await verifyPassword(password, user.password).catch((error) => {
                console.error("[-] Errore durante la verifica della password:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (!isPasswordValid) {
                console.log("[-] Login fallito: Password errata");
                return res.status(401).send({ message: "Password errata" });
            }

            // Generate JWT token
            const token = generateToken(user);
            if (!token) {
                console.error("[-] Errore durante la generazione del token JWT");
                return res.status(500).send({ message: "Errore durante il login" });
            }

            // Log successful login
            console.log("[+] Login effettuato con successo:", { username });

            // Send success response
            res.status(200).send({ message: "Login effettuato con successo", token });
        } catch (error) {
            console.error("[-] Errore durante il login:", error);
            res.status(500).send({ message: "Errore durante il login" });
        }
    }
};

export const logoutUserController = (mongodb) => {
    return async function logoutUser(req, res) {
        try {
            const decoded = await blacklistModel.create({ tokenId: req.token });
            if (!decoded) {
                console.error("[-] Errore durante la creazione della blacklist:", error);
                return res.status(500).send({ message: "Errore durante il logout" });
            }
            // Log the token blacklisting
            console.log("[+] Token JWT messo in blacklist:", req.token);

            // Log successful logout
            console.log("[+] Logout effettuato con successo");

            // Send success response
            res.status(200).send({ message: "Logout effettuato con successo" });
        } catch (error) {
            console.error("[-] Errore durante il logout:", error);
            res.status(500).send({ message: "Errore durante il logout" });
        }
    }
};

/**
 * @swagger
 * /api/user/token-status:
 *   get:
 *     tags:
 *       - Utente
 *     summary: Verifica stato token
 *     description: Verifica se il token JWT dell'utente è ancora valido
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *       401:
 *         description: Token non valido
 *       500:
 *         description: Errore del server
 */
export const tokenStatusUserController = (mongodb) => {
    return async function tokenStatus(req, res) {
        try {
            // verify jwt
            const isValid = verifyToken(req.token);
            if (!isValid) {
                console.log("[-] Token non valido");
                return res.status(401).send({ valid: false });
            }

            // If the token is valid, send success response
            console.log("[+] Controllo token espicito valido");
            res.status(200).send({ valid: true });
        } catch (error) {
            console.error("[-] Errore durante la verifica del token:", error);
            res.status(500).send({ message: "Errore durante la verifica del token" });
        }
    }
}

/**
 * @swagger
 * /api/user/info:
 *   get:
 *     tags:
 *       - Utente
 *     summary: Ottieni informazioni utente
 *     description: Recupera le informazioni del profilo dell'utente autenticato
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informazioni utente recuperate con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     favouriteWizard:
 *                       type: string
 *                     game_cards:
 *                       type: array
 *                     trades:
 *                       type: array
 *                     paymentInfo:
 *                       type: object
 *                     balance:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore del server
 */
export const getUserInfoController = (mongodb) => {
    return async function getUserInfo(req, res) {
        try {
            // Get user info from database
            console.log("[-] Recupero informazioni utente in corso:", req.userId);
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Send user info response
            const responseData = {
                username: user.username,
                email: user.email,
                favouriteWizard: user.favouriteWizard,
                game_cards: user.game_cards || [], // Ensure game_cards is an array
                trades: user.trades || [], // Ensure trades is an array
                paymentInfo: user.paymentInfo || {}, // Ensure paymentInfo is an object
                balance: user.balance || 0, // Ensure balance is a number
                createdAt: user.createdAt,
            };

            res.status(200).send({
                message: "Informazioni utente recuperate con successo",
                data: responseData
            });

            console.log("[+] Informazioni utente recuperate con successo");

        } catch (error) {
            console.error("[-] Errore durante il recupero delle informazioni utente:", error);
            res.status(500).send({ message: "Errore durante il recupero delle informazioni utente" });
        }
    }
}

/**
 * @swagger
 * /api/user/cards/search:
 *   post:
 *     tags:
 *       - Carte
 *     summary: Cerca carte dell'utente
 *     description: Filtra e ordina le carte dell'utente in base ai criteri specificati
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               searchQuery:
 *                 type: string
 *                 description: Query di ricerca per filtrare le carte
 *               sortBy:
 *                 type: string
 *                 enum: [alphabetic, quantity, attribute]
 *                 description: Metodo di ordinamento delle carte
 *               sortByAttributeName:
 *                 type: string
 *                 description: Nome dell'attributo per l'ordinamento (usato solo se sortBy è "attribute")
 *     responses:
 *       200:
 *         description: Carte filtrate e ordinate con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filtered_game_cards:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Errore del server
 */
export const searchUserCardsController = (mongodb) => {
    return async function searchUserCards(req, res) {
        try {
            // Get user info from database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Get search query and sort options from GET request
            const { searchQuery = "", sortBy, sortByAttributeName } = req.query;

            console.log("[-] Ricerca carte in corso:", {
                searchQuery,
                sortBy,
                attribute: sortByAttributeName,
            });

            // Validate input
            if ((sortBy == "attribute" && sortByAttributeName != null) || !sortBy) {
                console.log("[-] Ricerca fallita: Campi mancanti nella ricerca");
                return res.status(400).send({ message: "Non sono presenti tutti i campi per la ricerca" });
            }

            let filteredCards = [...user.game_cards];

            // If query is empty use all cards and skip card search
            if (searchQuery.trim() === "") {
                console.log("[-] Nessuna query di ricerca fornita, restituzione di tutte le carte");
            } else {
                // Filter cards based on search query
                const queryLower = searchQuery.trim().toLowerCase();

                // const userInput = "harry"; // o "!human" o "wizard"
                // const queryLower = userInput.toLowerCase();

                filteredCards = filteredCards.filter(card => {
                    // Determina se la ricerca è inversa e qual è il termine di ricerca effettivo.
                    let processedQuery = queryLower; // Inizializza con la query originale (già minuscola).
                    let isInverseSearch = false;

                    if (queryLower.startsWith('!')) {
                        isInverseSearch = true;
                        processedQuery = queryLower.substring(1); // Rimuove '!' per ottenere il termine di ricerca.
                    }

                    // Funzione helper per determinare se una carta corrisponde POSITIVAMENTE al termine di ricerca.
                    // Restituisce true se la carta corrisponde, false altrimenti.
                    const cardPositivelyMatches = (currentCard, queryTerm) => {
                        // Nome principale
                        if (currentCard.name && currentCard.name.toLowerCase().includes(queryTerm)) {
                            return true;
                        }

                        // Nomi alternativi
                        if (currentCard.alternate_names && Array.isArray(currentCard.alternate_names)) {
                            if (currentCard.alternate_names.some(altName =>
                                altName && altName.toLowerCase().includes(queryTerm)
                            )) {
                                return true;
                            }
                        }

                        // Specie
                        if (currentCard.species && currentCard.species.toLowerCase().includes(queryTerm)) {
                            return true;
                        }

                        // Genere
                        if (currentCard.gender && currentCard.gender.toLowerCase().includes(queryTerm)) {
                            return true;
                        }

                        // Casa di Hogwarts
                        if (currentCard.house && currentCard.house.toLowerCase().includes(queryTerm)) {
                            return true;
                        }

                        // Ascendenza
                        if (currentCard.ancestry && currentCard.ancestry.toLowerCase().includes(queryTerm)) {
                            return true;
                        }

                        // Colore degli occhi
                        if (currentCard.eyeColour && currentCard.eyeColour.toLowerCase().includes(queryTerm)) {
                            return true;
                        }

                        // Colore dei capelli
                        if (currentCard.hairColour && currentCard.hairColour.toLowerCase().includes(queryTerm)) {
                            return true;
                        }

                        // Bacchetta magica (legno, nucleo)
                        if (currentCard.wand) {
                            if (currentCard.wand.wood && currentCard.wand.wood.toLowerCase().includes(queryTerm)) {
                                return true;
                            }
                            if (currentCard.wand.core && currentCard.wand.core.toLowerCase().includes(queryTerm)) {
                                return true;
                            }
                        }

                        // Patronus
                        if (currentCard.patronus && currentCard.patronus.toLowerCase().includes(queryTerm)) {
                            return true;
                        }

                        // Attore principale
                        if (currentCard.actor && currentCard.actor.toLowerCase().includes(queryTerm)) {
                            return true;
                        }

                        // Attori alternativi
                        if (currentCard.alternate_actors && Array.isArray(currentCard.alternate_actors)) {
                            if (currentCard.alternate_actors.some(altActor =>
                                altActor && altActor.toLowerCase().includes(queryTerm)
                            )) {
                                return true;
                            }
                        }

                        // Ricerca per valori booleani specifici.
                        // Una "corrispondenza positiva" qui significa che il queryTerm corrisponde alla condizione booleana.
                        // Ad esempio, se queryTerm è "wizard", una corrispondenza positiva si ha se card.wizard === true.
                        // Se queryTerm è "muggle", una corrispondenza positiva si ha se card.wizard === false.
                        if (queryTerm === 'wizard' || queryTerm === 'mago') {
                            if (currentCard.wizard === true) return true;
                        }
                        if (queryTerm === 'muggle' || queryTerm === 'babbano') {
                            // "muggle" corrisponde positivamente se la carta NON è un mago.
                            if (currentCard.wizard === false) return true;
                        }
                        if (queryTerm === 'student' || queryTerm === 'studente') {
                            if (currentCard.hogwartsStudent === true) return true;
                        }
                        if (queryTerm === 'staff' || queryTerm === 'professore' || queryTerm === 'insegnante') {
                            if (currentCard.hogwartsStaff === true) return true;
                        }
                        if (queryTerm === 'alive' || queryTerm === 'vivo') {
                            if (currentCard.alive === true) return true;
                        }
                        if (queryTerm === 'dead' || queryTerm === 'morto') {
                            // "dead" corrisponde positivamente se la carta NON è viva.
                            if (currentCard.alive === false) return true;
                        }

                        // Ricerca per anno di nascita
                        if (currentCard.yearOfBirth && currentCard.yearOfBirth.toString().includes(queryTerm)) {
                            return true;
                        }

                        // Se nessuna delle condizioni precedenti è soddisfatta, la carta non corrisponde positivamente.
                        return false;
                    };

                    // Verifica se la carta corrente corrisponde positivamente al termine di ricerca processato.
                    const hasPositiveMatch = cardPositivelyMatches(card, processedQuery);

                    // Decide se mantenere la carta in base al tipo di ricerca (normale o inversa).
                    if (isInverseSearch) {
                        // Per una ricerca inversa (es. "!human"), mantenere la carta se NON c'è una corrispondenza positiva.
                        return !hasPositiveMatch;
                    } else {
                        // Per una ricerca normale (es. "human"), mantenere la carta se C'È una corrispondenza positiva.
                        return hasPositiveMatch;
                    }
                });
            }

            // Sort cards based on sort options
            try {
                if (sortBy === "alphabetic") {
                    filteredCards.sort((a, b) => {
                        const nameA = a.name || "";
                        const nameB = b.name || "";
                        return nameA.localeCompare(nameB);
                    });
                } else if (sortBy === "quantity") {
                    filteredCards.sort((a, b) => {
                        const qtyA = a.quantity || 0;
                        const qtyB = b.quantity || 0;
                        return qtyB - qtyA;
                    });
                } else if (sortBy === "attribute") {
                    filteredCards.sort((a, b) => {
                        const valueA = a[sortByAttributeName];
                        const valueB = b[sortByAttributeName];

                        // --- GESTIONE PRIORITARIA DEI VALORI SPECIALI ("?", null, undefined) ---
                        // L'obiettivo è ottenere un ordinamento dove:
                        // 1. Gli elementi "normali" vengono prima, ordinati tra loro.
                        // 2. Seguono gli elementi con valore null/undefined.
                        // 3. Infine, gli elementi con valore "?".
                        // Questo dà l'effetto di "rimuovere" i null/? e "reinserirli" alla fine nell'ordine corretto.

                        // --- PRIMA REGOLA DI PRIORITÀ: Gestione dei valori "?" ---
                        // I valori "?" devono essere sempre considerati i più "grandi", quindi vanno alla fine assoluta.
                        const isAQuestionMark = valueA === "";
                        const isBQuestionMark = valueB === "";

                        if (isAQuestionMark && isBQuestionMark) {
                            // Se entrambi sono "?", sono uguali in questo contesto di gruppo.
                            return 0;
                        }
                        if (isAQuestionMark) {
                            // Se solo valueA è "?", A è "maggiore" e va dopo B.
                            return 1; // Sposta A verso la fine.
                        }
                        if (isBQuestionMark) {
                            // Se solo valueB è "?", B è "maggiore" (quindi A è "minore") e A va prima di B.
                            return -1; // Sposta B verso la fine (lasciando A prima).
                        }

                        // A questo punto, sappiamo che né valueA né valueB sono "?".

                        // --- SECONDA REGOLA DI PRIORITÀ: Gestione dei valori null o undefined ---
                        // Questi valori vengono dopo i "normali" ma prima dei "?".
                        // Il controllo per "?" è già avvenuto, quindi questa logica li posiziona correttamente.
                        const isANullOrUndefined = valueA == null; // '==' cattura sia null che undefined.
                        const isBNullOrUndefined = valueB == null;

                        if (isANullOrUndefined && isBNullOrUndefined) {
                            // Se entrambi sono null/undefined, sono uguali in questo contesto di gruppo.
                            return 0;
                        }
                        if (isANullOrUndefined) {
                            // Se solo valueA è null/undefined, A va dopo B (che è un valore "normale").
                            return 1; // Sposta A dopo i valori normali (ma prima di eventuali "?").
                        }
                        if (isBNullOrUndefined) {
                            // Se solo valueB è null/undefined, B va dopo A (che è un valore "normale").
                            return -1; // Sposta B dopo i valori normali (lasciando A prima).
                        }

                        // A questo punto della funzione, i valori non sono "?", né null, né undefined.
                        // Si tratta di valori "normali" che devono essere ordinati tra loro.

                        // --- TERZA REGOLA: Ordinamento standard per valori "normali" ---
                        if (typeof valueA === 'number' && typeof valueB === 'number') {
                            // Ordinamento numerico ascendente.
                            return valueA - valueB;
                        } else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
                            // Ordinamento booleano (es. true prima di false).
                            // true (1) vs false (0). valueA ? -1 : 1 => se A è true, A viene prima (-1).
                            return valueA === valueB ? 0 : valueA ? -1 : 1;
                        } else {
                            // Per tutti gli altri casi (es. stringhe), si convertono i valori
                            // a stringa e si usa localeCompare per un ordinamento alfabetico.
                            return String(valueA).localeCompare(String(valueB));
                        }
                    });
                } else {
                    console.log("[-] Tipo di ordinamento non riconosciuto:", sortBy);
                    return res.status(400).send({ message: "Tipo di ordinamento non valido" });
                }
            } catch (sortError) {
                console.error("[-] Errore durante l'ordinamento:", sortError);
                return res.status(500).send({ message: "Errore durante l'ordinamento delle carte" });
            }

            console.log(`[+] Carte filtrate e ordinate con successo: query="${searchQuery}" - sortBy=${sortBy} - sortByAttributeName=${sortByAttributeName} - CardsCount=${filteredCards.length}`);

            // Send response with filtered and sorted cards
            res.status(200).send({
                message: "Carte filtrate e ordinate con successo",
                filtered_game_cards: filteredCards
            });

        } catch (error) {
            console.error("[-] Errore durante la ricerca delle carte:", error);
            res.status(500).send({ message: "Errore durante la ricerca delle carte" });
        }
    }
}

/**
 * @swagger
 * /api/user/cards/missing:
 *   get:
 *     tags:
 *       - Carte
 *     summary: Ottieni carte mancanti
 *     description: Recupera la lista delle carte che mancano nella collezione dell'utente
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carte mancanti recuperate con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 missing:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Errore del server
 */
export const getUserMissingCardsController = (mongodb) => {
    return async function getUserMissingCards(req, res) {
        try {
            // Get user info from database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }
            
            // Get all cards from the database
            let missingCards = user.game_cards.filter(card => card.quantity === 0);
            if (missingCards.length === 0) {
                console.log("[-] Nessuna carta mancante trovata per l'utente:", user.username);
                missingCards = []; // Ensure missingCards is an empty array if no cards are missing
            }
            
            //fetch user trade that are open and not expired
            const userTrades = user.trades || [];
            console.log("[-] Recupero trades in corso per l'utente:", user.username);
            const trades = await tradeModel.find({ _id: { $in: userTrades }, status: 'open' }).catch((error) => {
                console.error("[-] Errore durante il recupero dei trades:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (trades && trades.length > 0) {
                // Transform missingCards array and add alreadyRequested property
                missingCards = missingCards.map(card => {
                    const cardObj = card.toObject(); // Convert Mongoose document to plain object
                    cardObj.alreadyRequested = trades.some(trade => 
                        trade.requested_cardIds.some(requestedCard => requestedCard.id === cardObj.id)
                    );
                    if (cardObj.alreadyRequested) {
                        console.log("[-] Carta già richiesta in uno scambio:", cardObj.name);
                    }
                    return cardObj;
                });
            } else {
                // Convert to plain objects even if no trades exist
                missingCards = missingCards.map(card => card.toObject());
            }

            console.log("[+] Carte mancanti recuperate con successo:", missingCards.length);

            // Send response with missing cards
            res.status(200).send({
                message: "Carte mancanti recuperate con successo",
                missingCards: missingCards
            });

        } catch (error) {
            console.error("[-] Errore durante la ricerca delle carte mancanti:", error);
            res.status(500).send({ message: "Errore durante la ricerca delle carte mancanti" });
        }
    }
}

/**
 * @swagger
 * /api/user/cards/doubles:
 *   get:
 *     tags:
 *       - Carte
 *     summary: Ottieni carte doppie
 *     description: Recupera la lista delle carte duplicate nella collezione dell'utente
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carte doppie recuperate con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 doubles:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Errore del server
 */
export const getUserDoubleCardsController = (mongodb) => {
    return async function getUserDoubleCards(req, res) {
        try {
            // Get user info from database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }
            // Get all cards from the database
            let doubleCards = user.game_cards.filter(card => card.quantity > 1);
            if (doubleCards.length === 0) {
                console.log("[-] Nessuna carta doppia trovata per l'utente:", user.username);
                return res.status(200).send({ message: "Nessuna carta doppia trovata", doubleCards: [] });
            }

            // remove 1 quantity from card that are alredy in trade offer as offered cards if the modify quantity is 0 remove from the array
            const tradeIds = user.trades || [];
            console.log("[-] Recupero trades in corso per l'utente:", user.username);
            const trades = await tradeModel.find({ _id: { $in: tradeIds } }).catch((error) => {
                console.error("[-] Errore durante il recupero dei trades:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (trades && trades.length > 0) {
                // filter only trades that are open and not expired
                const openTrades = trades.filter(trade => {
                    const currentTime = new Date();
                    return trade.expirationDate > currentTime && trade.status === 'open';
                });
                if (openTrades.length === 0) {
                    console.log("[-] Nessun trade aperto trovato per l'utente:", user.username);
                }
            }

            console.log("[+] Carte doppie recuperate con successo:", doubleCards.length);
            // Send response with double cards
            res.status(200).send({
                message: "Carte doppie recuperate con successo",
                doubleCards: doubleCards
            });
        } catch (error) {
            console.error("[-] Errore durante la ricerca delle carte doppie:", error);
            res.status(500).send({ message: "Errore durante la ricerca delle carte doppie" });
        }
    }
}

/**
 * @swagger
 * /api/user/update:
 *   put:
 *     tags:
 *       - Utente
 *     summary: Aggiorna informazioni utente
 *     description: Modifica le informazioni del profilo dell'utente autenticato
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               favouriteWizard:
 *                 type: string
 *     responses:
 *       200:
 *         description: Informazioni utente aggiornate con successo
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore del server
 */
export const updateUserInfoController = (mongodb) => {
    return async function updateUserInfo(req, res) {
        try {
            // Get user info from database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Update user info
            const { username, favouriteWizard } = req.body;

            // Validate input
            if (!username || !favouriteWizard) {
                console.log("[-] Aggiornamento fallito: Campi mancanti nell'aggiornamento");
                return res.status(400).send({ message: "Non sono presenti tutti i campi" });
            }

            // check if username contains @
            if (username.includes("@")) {
                console.log("[-] Aggiornamento fallito: Il nome utente non può contenere '@'");
                return res.status(400).send({ message: "Il nome utente non può contenere '@'" });
            }

            // check if username already exists
            const existingUser = await userModel.findOne({ username }).catch((error) => {
                console.error("[-] Errore durante la ricerca dell'utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                console.log("[-] Aggiornamento fallito: Nome utente già esistente");
                return res.status(400).send({ message: "Nome utente già esistente" });
            }

            // Update user information
            user.username = username;
            user.favouriteWizard = favouriteWizard;
            await user.save().catch((error) => {
                console.error("[-] Errore durante il salvataggio delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Log successful update
            console.log("[+] Informazioni utente aggiornate con successo:", { username, favouriteWizard });
            // Send success response
            res.status(200).send({ message: "Informazioni utente aggiornate con successo" });
        } catch (error) {
            console.error("[-] Errore durante l'aggiornamento delle informazioni utente:", error);
            res.status(500).send({ message: "Errore durante l'aggiornamento delle informazioni utente" });
        }
    }
}

/**
 * @swagger
 * /api/user/delete:
 *   delete:
 *     tags:
 *       - Utente
 *     summary: Elimina account utente
 *     description: Elimina l'account dell'utente autenticato e tutti i dati associati
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utente eliminato con successo
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore del server
 */
export const deleteUserController = (mongodb) => {
    return async function deleteUser(req, res) {
        try {
            // Get user info from database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Delete user
            await userModel.deleteOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante l'eliminazione dell'utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // blacklist token
            const blacklistedToken = await blacklistModel.create({ tokenId: req.token });
            if (!blacklistedToken) {
                console.error("[-] Errore durante la blacklist del token dell'utente eliminato");
                return res.status(500).send({ message: "Errore durante il logout" });
            }

            console.log("[+] Token utente appena eliminato messo in blacklist")

            //delete all trades
            await tradeModel.deleteMany({ userIdOffer: req.userId }).catch((error) => {
                console.error("[-] Errore durante l'eliminazione dei trade dell'utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            console.log("[+] Trade dell'utente eliminati con successo");
            
            console.log("[+] Utente eliminato con successo");
            res.status(200).send({ message: "Utente eliminato con successo" });
        } catch (error) {
            console.error("[-] Errore durante l'eliminazione dell'utente:", error);
            res.status(500).send({ message: "Errore durante l'eliminazione dell'utente" });
        }
    }
}

/**
 * @swagger
 * /api/user/cards/sell:
 *   post:
 *     tags:
 *       - Carte
 *     summary: Vendi carte
 *     description: Vende le carte selezionate dell'utente in cambio di crediti
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cards
 *             properties:
 *               cards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Carte vendute con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 creditsEarned:
 *                   type: number
 *       400:
 *         description: Dati non validi o quantità insufficiente
 *       404:
 *         description: Carta non trovata
 *       500:
 *         description: Errore del server
 */
export const sellUserCardsController = (mongodb) => {
    return async function sellUserCards(req, res) {
        try {
            const userId = req.userId;
            const { cards } = req.body;

            // cards = [{id, quantity}]

            console.log("[+] Vendita di carte in corso...")

            // Validate input
            if (!Array.isArray(cards) || cards.length === 0) {
                console.log(cards)
                console.log("[-] Vendita fallita: Nessuna carta selezionata");
                return res.status(400).send({ message: "Nessuna carta selezionata" });
            }

            // Get user info from database
            const user = await userModel.findOne({ _id: userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // for ech card to sell check if the user has enough quantity
            // if yes subtract quantity from that card with a min of 1, for every 2 card add 1 to the balance
            // if no send an error message
            let earned = 0; // Total credits earned from selling cards

            for (const card of cards) {
                const userCard = user.game_cards.find(c => c.id.toString() === card.id);
                if (!userCard) {
                    console.log(`[-] Carta con ID ${card.id} non trovata tra le carte dell'utente`);
                    return res.status(404).send({ message: `Carta con ID ${card.id} non trovata` });
                }

                if (userCard.quantity - 1 < card.quantity || card.quantity <= 0) {
                    console.log(`[-] Quantità insufficiente per la carta con ID ${card.id}`);
                    return res.status(400).send({ message: `Quantità insufficiente per la carta con ID ${card.id}` });
                }

                // Calculate balance increment
                const balanceIncrement = Math.floor(card.quantity / 2);
                user.balance += balanceIncrement;
                earned += balanceIncrement;
                console.log(`[+] Vendita di ${card.quantity} carte con ID ${card.id}, guadagno di ${balanceIncrement} crediti`);

                // Subtract quantity from the user's card
                userCard.quantity -= card.quantity;
            }

            // save to the database
            await userModel.updateOne({ _id: userId }, { $set: { game_cards: user.game_cards, balance: user.balance } }).catch((error) => {
                console.error("[-] Errore durante il salvataggio delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            console.log("[+] Vendita delle carte completata con successo");
            res.status(200).send({ message: "Vendita delle carte completata con successo", creditsEarned: earned });
        } catch (error) {
            console.error("[-] Errore durante la vendita delle carte:", error);
            res.status(500).send({ message: "Errore durante la vendita delle carte" });
        }
    }
}

/**
 * @swagger
 * /api/user/cards/package/open:
 *   post:
 *     tags:
 *       - Pacchetti
 *     summary: Apri un pacchetto di carte
 *     description: Apre un nuovo pacchetto di carte e aggiunge le carte alla collezione dell'utente
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pacchetto aperto con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newCards:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Crediti insufficienti
 *       500:
 *         description: Errore del server
 */
export const openPackageCardsUserController = (mongodb) => {
    return async function openPackageCards(req, res) {
        try {
            const userId = req.userId;
            const { quantity } = req.body;

            console.log("[+] Apertura pacchetto carte in corso...");

            // check if the quantity
            if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
                console.log("[-] Apertura pacchetto fallita: Quantità non valida");
                return res.status(400).send({ message: "Quantità non valida" });
            }

            // Get user info from database
            const user = await userModel.findOne({ _id: userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Check if the user has enough balance to open the package
            const packageCost = 1; // Example cost for opening a package
            if (user.balance < packageCost * quantity) {
                console.log("[-] Apertura pacchetto fallita: Crediti insufficienti");
                return res.status(400).send({ message: "Crediti insufficienti per aprire il pacchetto" });
            }

            // Deduct the cost from the user's balance
            user.balance -= packageCost * quantity;

            // Generate random cards for the package
            const newCards = generateRandomCards(user.game_cards, 5 * quantity); // Example: 5 random cards

            // Add new cards to the user's game_cards
            newCards.forEach(card => {
                const existingCard = user.game_cards.find(c => c.id === card.id);
                if (existingCard) {
                    card.quantity += 1; // Update the card quantity in the newCards array
                    existingCard.quantity = card.quantity; // Increment quantity if card already exists
                    console.log(`[+] Carta con ID ${card.id} già esistente, quantità aggiornata a ${existingCard.quantity}`);
                } else {
                    user.game_cards.push(card); // Add new card if it doesn't exist
                }
            });

            // Save updated user information to the database
            await userModel.updateOne({ _id: userId }, { $set: { game_cards: user.game_cards, balance: user.balance } }).catch((error) => {
                console.error("[-] Errore durante il salvataggio delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            console.log("[+] Pacchetto carte aperto con successo");
            res.status(200).send({ message: "Pacchetto carte aperto con successo", newCards, remainingCredits: user.balance });
        } catch (error) {
            console.error("[-] Errore durante l'apertura del pacchetto carte:", error);
            res.status(500).send({ message: "Errore durante l'apertura del pacchetto carte" });
        }
    }
}

/**
 * @swagger
 * /api/user/credits/buy:
 *   post:
 *     tags:
 *       - Crediti
 *     summary: Acquista crediti
 *     description: Aggiunge crediti al saldo dell'utente
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Quantità di crediti da acquistare
 *     responses:
 *       200:
 *         description: Crediti acquistati con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newBalance:
 *                   type: number
 *       400:
 *         description: Quantità non valida
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore del server
 */
export const buyCreditUserController = (mongodb) => {
    return async function buyCredits(req, res) {
        try {
            const userId = req.userId;
            const { amount } = req.body;

            console.log(`[+] Acquisto di ${amount} crediti...`);

            // check if the quantity
            if (!amount || typeof amount !== 'number' || amount <= 0) {
                console.log("[-] Apertura pacchetto fallita: Quantità non valida");
                return res.status(400).send({ message: "Quantità non valida" });
            }

            // Get user info from database
            const user = await userModel.findOne({ _id: userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // add to the user's balance
            user.balance += amount;

            // Save updated user information to the database
            await userModel.updateOne({ _id: userId }, { $set: { balance: user.balance } }).catch((error) => {
                console.error("[-] Errore durante il salvataggio delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            console.log("[+] Acquisto completato con successo");
            res.status(200).send({ message: "Acquisto completato con successo", newBalance: user.balance });
        } catch (error) {
            console.error("[-] Errore durante l'apertura del pacchetto carte:", error);
            res.status(500).send({ message: "Errore durante l'apertura del pacchetto carte" });
        }
    }
}

/**
 * @swagger
 * /api/user/my-trades:
 *   get:
 *     tags:
 *       - Scambi
 *     summary: Ottieni tutti gli scambi creati dall'utente
 *     description: Recupera la lista completa degli scambi creati dall'utente autenticato
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista degli scambi recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trades:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userIdOffer:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                       offered_cardIds:
 *                         type: array
 *                       requested_cardIds:
 *                         type: array
 *                       status:
 *                         type: string
 *                         enum: [open, completed, cancelled]
 *                       expirateAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Errore del server
 */
export const getUserAllTrades = (mongodb) => {
    return async function getUserTrades(req, res) {
        try {
            console.log("[+] Recupero scambi proposti dell'utente in corso...");

            // Recupera le informazioni dell'utente dal database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero dell'utente:", error);
                throw error; // Rilancia l'errore invece di inviare la risposta qui
            });

            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Controlla se l'utente ha trades (correggi il controllo)
            if (!user.trades || user.trades.length === 0) {
                console.log("[+] L'utente non ha mai proposto uno scambio");
                return res.status(200).send({ 
                    message: "Scambi proposti dell'utente recuperati con successo", 
                    trades: [] 
                });
            }

            // SOLUZIONE 1: Usa Promise.all per gestire le operazioni asincrone in parallelo
            console.log("[+] Recupero dettagli degli scambi...");
            
            const tradePromises = user.trades.map(async (tradeId) => {
                try {
                    // Usa findById invece di find per un singolo documento
                    const trade = await tradeModel.findById(tradeId);
                    return trade;
                } catch (error) {
                    console.error(`[-] Errore durante il recupero dello scambio ${tradeId}:`, error);
                    return null; // Restituisce null per gli scambi non trovati
                }
            });

            // Attende che tutte le Promise si risolvano
            const userTrades = await Promise.all(tradePromises);
            
            // Filtra i risultati null (scambi non trovati o con errori)
            const validTrades = userTrades.filter(trade => trade !== null);
            validTrades.sort((a, b) => new Date(b.expirateAt) - new Date(a.expirateAt)); // ordinamento per data di scadenza: quello che scade prima appare più in alto

            console.log("[+] Scambi proposti recuperati con successo:", validTrades.length);
            res.status(200).send({ 
                message: "Scambi proposti dell'utente recuperati con successo", 
                trades: validTrades 
            });

        } catch (error) {
            console.error("[-] Errore durante il recupero degli scambi proposti dell'utente:", error);
            res.status(500).send({ message: "Errore durante il recupero degli scambi dell'utente" });
        }
    }
}