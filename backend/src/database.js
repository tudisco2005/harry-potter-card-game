import mongoose from "mongoose";

async function connectDB(protocol, host, username, password, dbName, collectionNames, options) {
    // Check if the host and dbName are provided
    if (!host || !dbName) {
        throw new Error("Host and database name must be provided");
    }

    // Construct the MongoDB connection URL
    // mongodb://username:password@host:port/database
    const url = `${protocol}://${username}:${password}@${host}/${dbName}${options}`;
    console.log(`[+] Connessione a MongoDB in corso: ${url}`);

    try {
        const mongodb = await mongoose.connect(url);

        console.log("[+] Connessione a MongoDB stabilita con successo");

        // Ottieni il database nativo MongoDB
        const db = mongodb.connection.db;

        // Verifica se il database esiste
        const admin = db.admin();
        const databases = await admin.listDatabases();
        const dbExists = databases.databases.some(database => database.name === dbName);

        if (dbExists) {
            console.log(`[+] Database '${dbName}' trovato`);
        } else {
            console.log(`[!] Database '${dbName}' non trovato, verrà creato automaticamente`);
        }

        // Verifica se una specifica collezione esiste 
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
        console.error("Errore durante la connessione a MongoDB:", error);
        process.exit(1);
    }
}

// Esporta la connessione
export default connectDB;