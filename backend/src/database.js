/**
 * File per la gestione della connessione al database MongoDB
 * Questo file gestisce la connessione al database, la verifica dell'esistenza
 * del database e delle collezioni, e la gestione degli errori di connessione
 */

import mongoose from "mongoose";

/**
 * Stabilisce una connessione al database MongoDB
 * @param {string} protocol - Protocollo di connessione (es. 'mongodb')
 * @param {string} host - Host del database
 * @param {string} username - Username per l'autenticazione
 * @param {string} password - Password per l'autenticazione
 * @param {string} dbName - Nome del database
 * @param {string[]} collectionNames - Array di nomi delle collezioni da verificare
 * @param {string} options - Opzioni aggiuntive per la connessione
 * @returns {Promise<Object>} Istanza della connessione MongoDB
 * @throws {Error} Se host o dbName non sono forniti
 */
async function connectDB(protocol, host, username, password, dbName, collectionNames, options) {
    // Verifica dei parametri obbligatori
    if (!host || !dbName) {
        throw new Error("Host and database name must be provided");
    }

    // Costruzione dell'URL di connessione MongoDB
    // Formato: mongodb://username:password@host:port/database
    const url = `${protocol}://${username}:${password}@${host}/${dbName}${options}`;
    console.log(`[+] Connessione a MongoDB in corso: ${url}`);

    try {
        // Tentativo di connessione al database
        const mongodb = await mongoose.connect(url);
        console.log("[+] Connessione a MongoDB stabilita con successo");

        // ==========================================
        // VERIFICA DATABASE E COLLEZIONI
        // ==========================================

        // Ottieni il database nativo MongoDB
        const db = mongodb.connection.db;

        // Verifica l'esistenza del database
        const admin = db.admin();
        const databases = await admin.listDatabases();
        const dbExists = databases.databases.some(database => database.name === dbName);

        if (dbExists) {
            console.log(`[+] Database '${dbName}' trovato`);
        } else {
            console.log(`[!] Database '${dbName}' non trovato, verrà creato automaticamente`);
        }

        // Verifica l'esistenza delle collezioni specificate
        await collectionNames.forEach(async element => {
            const collections = await db.listCollections({ name: element }).toArray();
            const collectionExists = collections.length > 0;

            if (collectionExists) {
                console.log(`[+] Collezione '${element}' trovata`);
            } else {
                console.log(`[!] Collezione '${element}' non trovata, verrà creata automaticamente, all'inserimento del primo oggetto`);
            }
        }); 

        return mongodb;
    } catch (error) {
        // Gestione dettagliata degli errori di connessione
        if (error.name === 'MongoServerError') {
            if (error.code === 18) {
                console.error("[-] MongoDB: errore di autenticazione: Credenziali non valide");
                throw new Error("Credenziali database non valide");
            } else if (error.code === 6) {
                console.error("[-] MongoDB: errore di connessione: Host non raggiungibile");
                throw new Error("Impossibile connettersi al server database");
            }
        }
        
        console.error("[-] MongoDB: errore durante la connessione:", error.message);
        throw new Error(`Errore di connessione al database: ${error.message}`);
    }
}

// Esporta la connessione
export default connectDB;