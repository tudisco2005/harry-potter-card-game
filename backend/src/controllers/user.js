import {hashPassword, verifyPassword} from '../crypto.js';
import userModel from '../models/user.js';
import blacklistSchema from './blacklist.js';
import { generateToken } from '../auth/auth.js';


export const createUserController = (mongodb) => {
    return async function registerUser(req, res) {
        const { username, email, favouriteWizard, password, confirmPassword } = req.body;
        
        // Validate input
        // - check if fields are not empty
        if(!username || !email || !favouriteWizard || !password || !confirmPassword) {
            console.log("[-] Registrazione fallita: Campi mancanti nella registrazione");
            return res.status(400).send({ message: "Non sono presenti tutti i campi" });
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

        try {
            await userModel.create({
                username,
                email,
                favouriteWizard,
                password: hash
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
            res.cookie("tokenJWT", token, {
                //httpOnly: true,
                //secure: process.env.NODE_ENV === "production", // Use secure cookies in production
                //sameSite: "Strict" // Prevent CSRF attacks
            });

            // Log successful login
            console.log("[+] Login effettuato con successo:", { username });

            // Send success response
            res.status(200).send({ message: "Login effettuato con successo" });
        } catch (error) {
            console.error("[-] Errore durante il login:", error);
            res.status(500).send({ message: "Errore durante il login" });
        }
    }
};

export const logoutUserController = (mongodb) => {
    return async function logoutUser(req, res) {
        try {
            console.log(req.cookies)
            // Check if the user is authenticated
            if (!req.cookies.tokenJWT) {
                console.log("[-] Logout fallito: Nessun token presente");
                return res.status(401).send({ message: "Non sei autenticato" });
            }

            // put jwt token in blacklist
            const token = req.cookies.tokenJWT;
            const decoded = await blacklistSchema.create({ tokenId: token });
            if (!decoded) {
                console.error("[-] Errore durante la creazione della blacklist:", error);
                return res.status(500).send({ message: "Errore durante il logout" });
            }
            // Log the token blacklisting
            console.log("[+] Token JWT messo in blacklist:", token);

            // Clear the JWT cookie
            res.clearCookie("tokenJWT");

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