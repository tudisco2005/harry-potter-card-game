import { hashPassword, verifyPassword } from '../auth/crypto.js';
import { userModel } from '../models/user.js';
import { tradeModel } from '../models/trade.js';
import blacklistModel from '../models/blacklist.js';
import { generateToken, verifyToken } from '../auth/auth.js';
import { generateRandomCards } from '../utils/utils.js';

// Costanti di validazione per i campi dell'utente
const VALIDATION = {
    PASSWORD: {
        MIN_LENGTH: 8, // Lunghezza minima della password
        REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/ // Regex per validare la password (deve contenere almeno una minuscola, una maiuscola e un numero)
    },
    EMAIL: {
        REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // Regex per validare l'email
    },
    USERNAME: {
        FORBIDDEN_CHAR: '@' // Carattere non permesso nel nome utente
    }
};

// Funzione di utilità per validare l'input dell'utente
const validateUserInput = (username, email, password) => {
    const errors = [];
    
    // Verifica se il nome utente contiene il carattere @
    if (username.includes(VALIDATION.USERNAME.FORBIDDEN_CHAR)) {
        errors.push("Il nome utente non può contenere '@'");
    }
    
    // Verifica se l'email è in un formato valido
    if (!VALIDATION.EMAIL.REGEX.test(email)) {
        errors.push("Formato email non valido");
    }
    
    // Verifica se la password soddisfa i requisiti di sicurezza
    if (!VALIDATION.PASSWORD.REGEX.test(password)) {
        errors.push("La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero");
    }
    
    return errors;
};

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Dati non validi o mancanti
 *       500:
 *         description: Errore del server
 */
/**
 * Controller per la registrazione di un nuovo utente
 * Gestisce la creazione di un nuovo account con validazione dei dati
 * e assegnazione delle carte iniziali
 */
export const createUserController = () => {
    return async function registerUser(req, res) {
        try {
            // Estrazione dei dati dalla richiesta
            const { username, email, favouriteWizard, password, confirmPassword } = req.body;

            // Verifica che tutti i campi obbligatori siano presenti
            if (!username || !email || !favouriteWizard || !password || !confirmPassword) {
                console.log("[-] Registrazione fallita: Campi mancanti nella registrazione");
                return res.status(400).send({ message: "Non sono presenti tutti i campi" });
            }

            // Validazione dei dati inseriti
            const validationErrors = validateUserInput(username, email, password);
            if (validationErrors.length > 0) {
                console.log(`[-] Registrazione fallita: ${validationErrors[0]}`);
                return res.status(400).send({ message: validationErrors[0] });
            }

            // Verifica che le password coincidano
            if (password !== confirmPassword) {
                console.log("[-] Registrazione fallita: Le password non corrispondono");
                return res.status(400).send({ message: "Le password non corrispondono" });
            }

            // Verifica se l'utente o l'email esistono già nel database
            const [existingUser, existingEmail] = await Promise.all([
                userModel.findOne({ username }),
                userModel.findOne({ email })
            ]);

            if (existingUser) {
                console.log("[-] Registrazione fallita: Nome utente già esistente");
                return res.status(400).send({ message: "Nome utente già esistente" });
            }
            if (existingEmail) {
                console.log("[-] Registrazione fallita: Email già esistente");
                return res.status(400).send({ message: "Email già esistente" });
            }

            // Criptazione della password
            const hash = await hashPassword(password);
            console.log("[+] Password hashata con successo");

            // Recupero delle carte iniziali dall'API esterna
            console.log("[-] Recupero carte iniziali in corso...");
            const response = await fetch('https://hp-api.onrender.com/api/characters');
            const cards = await response.json();
            const game_cards = cards.map(card => ({
                ...card,
                quantity: 0
            }));
            console.log("[+] Carte iniziali recuperate con successo");

            // Creazione del nuovo utente nel database
            const newUser = await userModel.create({
                username,
                email,
                favouriteWizard,
                password: hash,
                game_cards,
                balance: 5 // Saldo iniziale di 5 crediti
            });

            console.log("[+] Registrazione nuovo utente:", { username, email, favouriteWizard });
            return res.status(201).send({ message: "Registrazione con successo" });

        } catch (error) {
            console.error("[-] Errore durante la registrazione:", error);
            return res.status(500).send({ message: "Errore durante la registrazione" });
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
/**
 * Controller per l'autenticazione dell'utente
 * Gestisce il login verificando le credenziali e generando un token JWT
 */
export const loginUserController = () => {
    return async function loginUser(req, res) {
        try {
            // Estrazione delle credenziali dalla richiesta
            const { username, password } = req.body;
            console.log("[-] Login in corso:", { username });

            // Verifica che le credenziali siano state fornite
            if (!username || !password) {
                console.log("[-] Login fallito: Campi mancanti");
                return res.status(400).send({ message: "Username e password sono obbligatori" });
            }

            // Ricerca dell'utente nel database (può usare username o email)
            const user = await userModel.findOne({
                $or: [{ username }, { email: username }]
            });

            // Verifica che l'utente esista
            if (!user) {
                console.log("[-] Login fallito: Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Verifica della password
            const isValidPassword = await verifyPassword(password, user.password);
            if (!isValidPassword) {
                console.log("[-] Login fallito: Password errata");
                return res.status(401).send({ message: "Credenziali non valide" });
            }

            // Generazione del token JWT per l'autenticazione
            const token = await generateToken(user);
            console.log("[+] Login effettuato con successo:", { username });

            // Invio della risposta con il token
            return res.status(200).send({
                message: "Login effettuato con successo",
                token
            });

        } catch (error) {
            console.error("[-] Errore durante il login:", error);
            return res.status(500).send({ message: "Errore durante il login" });
        }
    }
};

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     tags:
 *       - Utente
 *     summary: Logout utente
 *     description: Disconnetti l'utente autenticato
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout effettuato con successo
 *       401:
 *         description: Token non valido
 *       500:
 *         description: Errore del server
 */
/**
 * Controller per il logout dell'utente
 * Gestisce la disconnessione mettendo il token JWT in blacklist
 */
export const logoutUserController = () => {
    return async function logoutUser(req, res) {
        try {
            // Aggiunta del token alla blacklist per invalidarlo
            const decoded = await blacklistModel.create({ tokenId: req.token });
            if (!decoded) {
                console.error("[-] Errore durante la creazione della blacklist:", error);
                return res.status(500).send({ message: "Errore durante il logout" });
            }
            
            // Log dell'operazione di blacklist del token
            console.log("[+] Token JWT messo in blacklist:", req.token);


            console.log("[+] Logout effettuato con successo");

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
 *                 message:
 *                   type: string
 *                 valid:
 *                   type: boolean
 *       401:
 *         description: Token non valido
 *       500:
 *         description: Errore del server
 */
/**
 * Controller per la verifica dello stato del token JWT
 * Controlla se il token dell'utente è ancora valido
 */
export const tokenStatusUserController = () => {
    return async function tokenStatus(req, res) {
        try {
            // Verifica della validità del token JWT
            const isValid = verifyToken(req.token);
            if (!isValid) {
                console.log("[-] Token non valido");
                return res.status(401).send({ valid: false });
            }

            // Se il token è valido, invia una risposta positiva
            console.log("[+] Controllo token esplicito valido");
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
/**
 * Controller per il recupero delle informazioni dell'utente
 * Restituisce i dettagli del profilo dell'utente autenticato
 */
export const getUserInfoController = () => {
    return async function getUserInfo(req, res) {
        try {
            // Recupero delle informazioni dell'utente dal database
            console.log("[-] Recupero informazioni utente in corso:", req.userId);
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Verifica che l'utente esista
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Preparazione dei dati da inviare nella risposta
            const responseData = {
                username: user.username,
                email: user.email,
                favouriteWizard: user.favouriteWizard,
                game_cards: user.game_cards || [], // Assicura che game_cards sia un array
                trades: user.trades || [], // Assicura che trades sia un array
                //paymentInfo: user.paymentInfo || {}, // Assicura che paymentInfo sia un oggetto
                balance: user.balance || 0, // Assicura che balance sia un numero
                createdAt: user.createdAt,
            };

            // Invio della risposta con i dati dell'utente
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
/**
 * Controller per la ricerca e il filtraggio delle carte dell'utente
 * Permette di filtrare e ordinare le carte in base a vari criteri
 */
export const searchUserCardsController = () => {
    return async function searchUserCards(req, res) {
        try {
            // Recupero delle informazioni dell'utente dal database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Verifica che l'utente esista
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Estrazione dei parametri di ricerca e ordinamento dalla richiesta
            const { searchQuery = "", sortBy, sortByAttributeName } = req.query;

            console.log("[-] Ricerca carte in corso:", {
                searchQuery,
                sortBy,
                attribute: sortByAttributeName,
            });

            // Validazione dei parametri di input
            if(sortBy == null || sortBy.trim() === "") {
                console.log("[-] Ricerca fallita: Tipo di ordinamento mancante");
                return res.status(400).send({ message: "Tipo di ordinamento mancante" });
            }

            if (sortBy == "attribute" && (sortByAttributeName == null || sortByAttributeName.trim() === "")) {
                console.log("[-] Ricerca fallita: Campi mancanti nella ricerca");
                return res.status(400).send({ message: "Non sono presenti tutti i campi per la ricerca" });
            }

            // Inizializzazione dell'array delle carte filtrate
            let filteredCards = [...user.game_cards];

            // Se la query è vuota, usa tutte le carte e salta la ricerca
            if (searchQuery.trim() === "") {
                console.log("[-] Nessuna query di ricerca fornita, restituzione di tutte le carte");
            } else {
                // Filtraggio delle carte in base alla query di ricerca
                const queryLower = searchQuery.trim().toLowerCase();

                filteredCards = filteredCards.filter(card => {
                    // Determina se la ricerca è inversa e qual è il termine di ricerca effettivo
                    let processedQuery = queryLower;
                    let isInverseSearch = false;

                    if (queryLower.startsWith('!')) {
                        isInverseSearch = true;
                        processedQuery = queryLower.substring(1);
                    }

                    // Funzione helper per determinare se una carta corrisponde positivamente al termine di ricerca
                    const cardPositivelyMatches = (currentCard, queryTerm) => {
                        // Ricerca nel nome principale
                        if (currentCard.name && currentCard.name.toLowerCase().includes(queryTerm)) {
                            return true;
                        }

                        // Ricerca nei nomi alternativi
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

                    // Verifica se la carta corrisponde positivamente al termine di ricerca
                    const hasPositiveMatch = cardPositivelyMatches(card, processedQuery);

                    // Decide se mantenere la carta in base al tipo di ricerca
                    return isInverseSearch ? !hasPositiveMatch : hasPositiveMatch;
                });
            }

            // Ordinamento delle carte in base alle opzioni specificate
            try {
                if (sortBy === "alphabetic") {
                    // Ordinamento alfabetico per nome
                    filteredCards.sort((a, b) => {
                        const nameA = a.name || "";
                        const nameB = b.name || "";
                        return nameA.localeCompare(nameB);
                    });
                } else if (sortBy === "quantity") {
                    // Ordinamento per quantità (decrescente)
                    filteredCards.sort((a, b) => {
                        const qtyA = a.quantity || 0;
                        const qtyB = b.quantity || 0;
                        return qtyB - qtyA;
                    });
                } else if (sortBy === "attribute") {
                    // Ordinamento per attributo specifico
                    filteredCards.sort((a, b) => {
                        const valueA = a[sortByAttributeName];
                        const valueB = b[sortByAttributeName];

                        // Gestione dei valori speciali ("?", null, undefined)
                        const isAQuestionMark = valueA === "";
                        const isBQuestionMark = valueB === "";

                        if (isAQuestionMark && isBQuestionMark) return 0;
                        if (isAQuestionMark) return 1;
                        if (isBQuestionMark) return -1;

                        // Gestione dei valori null o undefined
                        const isANullOrUndefined = valueA == null;
                        const isBNullOrUndefined = valueB == null;

                        if (isANullOrUndefined && isBNullOrUndefined) return 0;
                        if (isANullOrUndefined) return 1;
                        if (isBNullOrUndefined) return -1;

                        // Ordinamento standard per valori normali
                        if (typeof valueA === 'number' && typeof valueB === 'number') {
                            return valueA - valueB;
                        } else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
                            return valueA === valueB ? 0 : valueA ? -1 : 1;
                        } else {
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

            // Invio della risposta con le carte filtrate e ordinate
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
/**
 * Controller per il recupero delle carte mancanti dell'utente
 * Restituisce la lista delle carte che l'utente non possiede ancora
 */
export const getUserMissingCardsController = () => {
    return async function getUserMissingCards(req, res) {
        try {
            // Recupero delle informazioni dell'utente dal database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });
            
            // Verifica che l'utente esista
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }
            
            // Filtraggio delle carte con quantità 0 (carte mancanti)
            let missingCards = user.game_cards.filter(card => card.quantity === 0);
            if (missingCards.length === 0) {
                console.log("[-] Nessuna carta mancante trovata per l'utente:", user.username);
                missingCards = []; // Assicura che missingCards sia un array vuoto se non ci sono carte mancanti
            }
            
            // Recupero degli scambi aperti e non scaduti dell'utente
            const userTrades = user.trades || [];
            console.log("[-] Recupero trades in corso per l'utente:", user.username);
            const trades = await tradeModel.find({ _id: { $in: userTrades }, status: 'open' }).catch((error) => {
                console.error("[-] Errore durante il recupero dei trades:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Se ci sono scambi attivi
            if (trades && trades.length > 0) {
                missingCards = missingCards.map(card => {
                    const cardObj = card.toObject(); // Converte il documento Mongoose in oggetto semplice
                    cardObj.alreadyRequested = trades.some(trade => 
                        trade.requested_cardIds.some(requestedCard => requestedCard.id === cardObj.id)
                    );
                    if (cardObj.alreadyRequested) {
                        console.log("[-] Carta già richiesta in uno scambio:", cardObj.name);
                    }
                    return cardObj;
                });
            } else {
                // Converte in oggetti semplici anche se non ci sono scambi
                missingCards = missingCards.map(card => card.toObject());
            }

            console.log("[+] Carte mancanti recuperate con successo:", missingCards.length);

            // Invio della risposta con le carte mancanti
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
/**
 * Controller per il recupero delle carte doppie dell'utente
 * Restituisce la lista delle carte che l'utente possiede in più copie
 */
export const getUserDoubleCardsController = () => {
    return async function getUserDoubleCards(req, res) {
        try {
            // Recupero delle informazioni dell'utente dal database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });
            
            // Verifica che l'utente esista
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Filtraggio delle carte con quantità maggiore di 1 (carte doppie)
            let doubleCards = user.game_cards.filter(card => card.quantity > 1);
            if (doubleCards.length === 0) {
                console.log("[-] Nessuna carta doppia trovata per l'utente:", user.username);
                return res.status(200).send({ message: "Nessuna carta doppia trovata", doubleCards: [] });
            }

            // Recupero degli scambi dell'utente per verificare le carte già offerte
            const tradeIds = user.trades || [];
            console.log("[-] Recupero trades in corso per l'utente:", user.username);
            const trades = await tradeModel.find({ _id: { $in: tradeIds } }).catch((error) => {
                console.error("[-] Errore durante il recupero dei trades:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Filtraggio degli scambi aperti e non scaduti
            if (trades && trades.length > 0) {
                const openTrades = trades.filter(trade => {
                    const currentTime = new Date();
                    return trade.expirationDate > currentTime && trade.status === 'open';
                });
                if (openTrades.length === 0) {
                    console.log("[-] Nessun trade aperto trovato per l'utente:", user.username);
                }
            }

            console.log("[+] Carte doppie recuperate con successo:", doubleCards.length);
            
            // Invio della risposta con le carte doppie
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore del server
 */
/**
 * Controller per l'aggiornamento delle informazioni dell'utente
 * Permette di modificare username e mago preferito dell'utente
 */
export const updateUserInfoController = () => {
    return async function updateUserInfo(req, res) {
        try {
            // Recupero delle informazioni dell'utente dal database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Verifica che l'utente esista
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Estrazione dei nuovi dati dalla richiesta
            const { username, favouriteWizard } = req.body;

            // Validazione dei dati inseriti
            if (!username || !favouriteWizard) {
                console.log("[-] Aggiornamento fallito: Campi mancanti nell'aggiornamento");
                return res.status(400).send({ message: "Non sono presenti tutti i campi" });
            }

            // Verifica che il nome utente non contenga @
            if (username.includes("@")) {
                console.log("[-] Aggiornamento fallito: Il nome utente non può contenere '@'");
                return res.status(400).send({ message: "Il nome utente non può contenere '@'" });
            }

            // Verifica che il nuovo username non sia già in uso
            const existingUser = await userModel.findOne({ username }).catch((error) => {
                console.error("[-] Errore durante la ricerca dell'utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                console.log("[-] Aggiornamento fallito: Nome utente già esistente");
                return res.status(400).send({ message: "Nome utente già esistente" });
            }

            // Aggiornamento delle informazioni dell'utente
            user.username = username;
            user.favouriteWizard = favouriteWizard;
            await user.save()

            // Log dell'aggiornamento riuscito
            console.log("[+] Informazioni utente aggiornate con successo:", { username, favouriteWizard });
            
            // Invio della risposta di successo
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore del server
 */
/**
 * Controller per l'eliminazione dell'account utente
 * Rimuove l'utente e tutti i dati associati dal sistema
 */
export const deleteUserController = () => {
    return async function deleteUser(req, res) {
        try {
            // Recupero delle informazioni dell'utente dal database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Verifica che l'utente esista
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Eliminazione dell'utente dal database
            await userModel.deleteOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante l'eliminazione dell'utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Aggiunta del token alla blacklist per invalidarlo
            const blacklistedToken = await blacklistModel.create({ tokenId: req.token });
            if (!blacklistedToken) {
                console.error("[-] Errore durante la blacklist del token dell'utente eliminato");
                return res.status(500).send({ message: "Errore durante il logout" });
            }

            console.log("[+] Token utente appena eliminato messo in blacklist")

            // Eliminazione di tutti gli scambi dell'utente
            await tradeModel.deleteMany({ userIdOffer: req.userId }).catch((error) => {
                console.error("[-] Errore durante l'eliminazione dei trade dell'utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            console.log("[+] Trade dell'utente eliminati con successo");
            
            // Log dell'eliminazione riuscita
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
/**
 * Controller per la vendita delle carte dell'utente
 * Permette di vendere le carte in cambio di crediti
 */
export const sellUserCardsController = () => {
    return async function sellUserCards(req, res) {
        try {
            const userId = req.userId;
            const { cards } = req.body;

            console.log("[+] Vendita di carte in corso...")

            // Validazione dell'input
            if (!Array.isArray(cards) || cards.length === 0) {
                console.log(cards)
                console.log("[-] Vendita fallita: Nessuna carta selezionata");
                return res.status(400).send({ message: "Nessuna carta selezionata" });
            }

            // Recupero delle informazioni dell'utente dal database
            const user = await userModel.findOne({ _id: userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Verifica che l'utente esista
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Per ogni carta da vendere:
            // - Verifica che l'utente abbia abbastanza copie
            // - Sottrae la quantità venduta (minimo 1)
            // - Aggiunge crediti al saldo (1 credito ogni 2 carte)
            let earned = 0; // Totale crediti guadagnati dalla vendita

            for (const card of cards) {
                // Ricerca della carta tra quelle dell'utente
                const userCard = user.game_cards.find(c => c.id.toString() === card.id);
                if (!userCard) {
                    console.log(`[-] Carta con ID ${card.id} non trovata tra le carte dell'utente`);
                    return res.status(404).send({ message: `Carta con ID ${card.id} non trovata` });
                }

                // Verifica che l'utente abbia abbastanza copie della carta
                if (userCard.quantity - 1 < card.quantity || card.quantity <= 0) {
                    console.log(`[-] Quantità insufficiente per la carta con ID ${card.id}`);
                    return res.status(400).send({ message: `Quantità insufficiente per la carta con ID ${card.id}` });
                }

                // Calcolo dell'incremento del saldo
                const balanceIncrement = Math.floor(card.quantity / 2);
                user.balance += balanceIncrement;
                earned += balanceIncrement;
                console.log(`[+] Vendita di ${card.quantity} carte con ID ${card.id}, guadagno di ${balanceIncrement} crediti`);

                // Sottrazione della quantità venduta dalla carta dell'utente
                userCard.quantity -= card.quantity;
            }

            // Salvataggio delle modifiche nel database
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: Numero di pacchetti da aprire
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
 *                 remainingCredits:
 *                   type: number
 *       400:
 *         description: Crediti insufficienti o quantità non valida
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore del server
 */
/**
 * Controller per l'apertura dei pacchetti di carte
 * Permette di acquistare e aprire pacchetti di carte usando i crediti
 */
export const openPackageCardsUserController = () => {
    return async function openPackageCards(req, res) {
        try {
            const userId = req.userId;
            const { quantity } = req.body;

            console.log("[+] Apertura pacchetto carte in corso...");

            // Validazione della quantità di pacchetti
            if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
                console.log("[-] Apertura pacchetto fallita: Quantità non valida");
                return res.status(400).send({ message: "Quantità non valida" });
            }

            // Recupero delle informazioni dell'utente dal database
            const user = await userModel.findOne({ _id: userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Verifica che l'utente esista
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Verifica che l'utente abbia abbastanza crediti per aprire i pacchetti
            const packageCost = 1; // Costo per aprire un pacchetto
            if (user.balance < packageCost * quantity) {
                console.log("[-] Apertura pacchetto fallita: Crediti insufficienti");
                return res.status(400).send({ message: "Crediti insufficienti per aprire il pacchetto" });
            }

            // Sottrazione del costo dei pacchetti dal saldo dell'utente
            user.balance -= packageCost * quantity;

            // Generazione delle carte casuali per i pacchetti
            const newCards = generateRandomCards(user.game_cards, 5 * quantity); // 5 carte casuali per pacchetto

            // Aggiunta delle nuove carte alla collezione dell'utente
            newCards.forEach(card => {
                const existingCard = user.game_cards.find(c => c.id === card.id);
                if (existingCard) {
                    card.quantity += 1; // Aggiorna la quantità della carta nell'array newCards
                    existingCard.quantity = card.quantity; // Incrementa la quantità se la carta esiste già
                    console.log(`[+] Carta con ID ${card.id} già esistente, quantità aggiornata a ${existingCard.quantity}`);
                } else {
                    user.game_cards.push(card); // Aggiungi la nuova carta se non esiste
                }
            });

            // Salvataggio delle modifiche nel database
            await userModel.updateOne(
                { _id: userId }, 
                { $set: { game_cards: user.game_cards, balance: user.balance } }
            )

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
/**
 * Controller per l'acquisto di crediti
 * Permette di aggiungere crediti al saldo dell'utente
 */
export const buyCreditUserController = () => {
    return async function buyCredits(req, res) {
        try {
            const userId = req.userId;
            const { amount } = req.body;

            console.log(`[+] Acquisto di ${amount} crediti...`);

            // Validazione della quantità di crediti
            if (!amount || typeof amount !== 'number' || amount <= 0) {
                console.log("[-] Acquisto crediti fallito: Quantità non valida");
                return res.status(400).send({ message: "Quantità non valida" });
            }

            // Recupero delle informazioni dell'utente dal database
            const user = await userModel.findOne({ _id: userId }).catch((error) => {
                console.error("[-] Errore durante il recupero delle informazioni utente:", error);
                return res.status(500).send({ message: "Errore Server" });
            });

            // Verifica che l'utente esista
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Aggiunta dei crediti al saldo dell'utente
            user.balance += amount;

            // Salvataggio delle modifiche nel database
            await userModel.updateOne({ _id: userId }, { $set: { balance: user.balance } })

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
export const getUserAllTrades = () => {
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


            console.log("[+] Recupero dettagli degli scambi...");
            
            const tradePromises = user.trades.map(async (tradeId) => {
                try {

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