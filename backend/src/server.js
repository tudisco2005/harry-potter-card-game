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

// ==========================================
// CONFIGURAZIONE DATABASE
// ==========================================

// Connessione al database MongoDB utilizzando le variabili d'ambiente
const mongodb = await connectDB(
    process.env.PROTOCOL,
    process.env.MONGO_HOST, 
    process.env.MONGO_USERNAME, 
    process.env.MONGO_PASSWORD, 
    process.env.MONGO_DATABASE_NAME, 
    String(process.env.MONGO_DATABASE_COLLECTIONS).split(","),
    process.env.MONGO_CONNECTION_OPTIONS
);

// ==========================================
// INIZIALIZZAZIONE SERVER
// ==========================================

// Inizializzazione dell'applicazione Express con la connessione MongoDB
const app = await initApp();

// Creazione del server HTTP utilizzando l'app Express
const server = http.createServer(app);

// Configurazione della porta del server (default: 3000)
const PORT = process.env.SERVER_PORT || 3000;

// Avvio del server sulla porta specificata
server.listen(PORT, () => {
    console.log(`[+] Server avviato e in esecuzione sulla porta: ${PORT}`);
});

