import { hashPassword, verifyPassword } from '../auth/crypto.js';
import { userModel } from '../models/user.js';
import blacklistSchema from './blacklist.js';
import { generateToken, verifyToken } from '../auth/auth.js';
import { generateRandomCards } from '../utils/utils.js';


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


        try {
            await userModel.create({
                username,
                email,
                favouriteWizard,
                password: hash,
                game_cards
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
            const decoded = await blacklistSchema.create({ tokenId: req.token });
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

// recive {searchQuery, sortBy, sortByAttributeName }
// searchQuery is a string to search in the cards all attributes
// sortby options "alphabetic", "quantity", "attribute"

// return `{filtered_game_cards}` with the filtered and sorted cards
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

            console.log("[+] Carte filtrate e ordinate con successo:", {
                searchQuery,
                sortBy,
                sortByAttributeName,
                filteredCardsCount: filteredCards.length
            });

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
            const blacklistedToken = await blacklistSchema.create({ tokenId: req.token });
            if (!blacklistedToken) {
                console.error("[-] Errore durante la blacklist del token dell'utente eliminato");
                return res.status(500).send({ message: "Errore durante il logout" });
            }

            console.log("[+] Token utente appena eliminato messo in blacklist")

            console.log("[+] Utente eliminato con successo");
            res.status(200).send({ message: "Utente eliminato con successo" });
        } catch (error) {
            console.error("[-] Errore durante l'eliminazione dell'utente:", error);
            res.status(500).send({ message: "Errore durante l'eliminazione dell'utente" });
        }
    }
}

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