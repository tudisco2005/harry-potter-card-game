import {hashPassword, verifyPassword} from '../auth/crypto.js';
import userModel from '../models/user.js';
import blacklistSchema from './blacklist.js';
import { generateToken,verifyToken } from '../auth/auth.js';


export const createUserController = (mongodb) => {
    return async function registerUser(req, res) {
        const { username, email, favouriteWizard, password, confirmPassword } = req.body;
        
        // Validate input
        // - check if fields are not empty
        if(!username || !email || !favouriteWizard || !password || !confirmPassword) {
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
        if(password != confirmPassword) {
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
            if (!username  || !favouriteWizard) {
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