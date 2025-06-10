/**
 * File principale per l'avvio del server
 * Questo file gestisce l'inizializzazione del server HTTP e la connessione al database
 */

import http from "http";
import dotenv from "dotenv";
import { initApp } from "./app.js";
import connectDB from "./database.js";

// Caricamento delle variabili d'ambiente dal file .env
dotenv.config();

// Verifica che tutte le variabili d'ambiente necessarie siano presenti
const requiredEnvVars = [
    'PROTOCOL',
    'MONGO_HOST',
    'MONGO_USERNAME',
    'MONGO_PASSWORD',
    'MONGO_DATABASE_NAME',
    'MONGO_DATABASE_COLLECTIONS'
];

// Controllo delle variabili d'ambiente mancanti
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    throw new Error(`Variabili d'ambiente mancanti: ${missingEnvVars.join(', ')}`);
}

// ==========================================
// CONFIGURAZIONE DATABASE
// ==========================================

// Tentativo di connessione al database MongoDB
let mongodb;
try {
    mongodb = await connectDB(
        process.env.PROTOCOL,
        process.env.MONGO_HOST, 
        process.env.MONGO_USERNAME, 
        process.env.MONGO_PASSWORD, 
        process.env.MONGO_DATABASE_NAME, 
        String(process.env.MONGO_DATABASE_COLLECTIONS).split(","),
        process.env.MONGO_CONNECTION_OPTIONS
    );
    console.log('[+] Connessione al database stabilita con successo');
} catch (error) {
    console.error('[-] Errore durante la connessione al database:', error);
    process.exit(1);
}

// ==========================================
// INIZIALIZZAZIONE SERVER
// ==========================================

let app;
try {
    app = await initApp();
} catch (error) {
    console.error('[-] Errore durante l\'inizializzazione dell\'app:', error);
    process.exit(1);
}

const server = http.createServer(app);
const PORT = process.env.SERVER_PORT || 3000;

// Gestione degli errori del server
server.on('error', (error) => {
    console.error('[-] Errore del server:', error);
    process.exit(1);
});

// Gestione della chiusura pulita del server
process.on('SIGTERM', () => {
    console.log('[+] Chiusura del server in corso...');
    server.close(() => {
        console.log('[+] Server chiuso con successo');
        process.exit(0);
    });
});

// Avvio del server sulla porta specificata
server.listen(PORT, () => {
    console.log(`[+] Server avviato e in esecuzione sulla porta: ${PORT}`);
});

