import {hashPassword, verifyPassword} from '../crypto.js';
import userModel from '../models/user.js';


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