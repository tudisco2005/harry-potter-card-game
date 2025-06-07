/**
 * File principale per la gestione delle route dell'API
 * Questo file definisce tutti gli endpoint disponibili e le relative funzioni di gestione
 */

import express from "express";
// Importazione dei controller per la gestione degli utenti
import { 
    createUserController, 
    loginUserController, 
    logoutUserController, 
    tokenStatusUserController,
    getUserInfoController,
    updateUserInfoController,
    deleteUserController,
    searchUserCardsController,
    sellUserCardsController,
    openPackageCardsUserController,
    buyCreditUserController,
    getUserMissingCardsController,
    getUserDoubleCardsController,
    getUserAllTrades
} from "./controllers/user.js";

// Importazione dei controller per la gestione degli scambi
import {
    createTradeController,
    getAllTradesController,
    acceptTradeController,
    deleteTradeController
} from "./controllers/trade.js";

// Importazione dei middleware di autenticazione e utilità
import { authenticateUser } from "./auth/auth.js";
import { checkExpiredTrades } from './utils/checkExpiredTrades.js';

// Inizializzazione del router Express per gestire le richieste HTTP
const router = express.Router();

/**
 * Funzione per inizializzare tutte le route dell'applicazione
 * @param {Object} mongodb - Istanza della connessione MongoDB
 * @returns {Router} Router Express configurato con tutte le route
 */
export const initRoutes = async () => {
    // ==========================================
    // SEZIONE 1: GESTIONE UTENTI E AUTENTICAZIONE
    // ==========================================
    
    // Endpoint per la registrazione e autenticazione
    router.post("/user/register", createUserController()); // Crea un nuovo account utente
    router.post("/user/login", loginUserController()); // Autentica un utente esistente
    router.get("/user/token-status", await authenticateUser, tokenStatusUserController()) // Verifica la validità del token JWT
    router.post("/user/logout", await authenticateUser, logoutUserController()); // Termina la sessione utente
    
    // ==========================================
    // SEZIONE 2: GESTIONE PROFILO UTENTE
    // ==========================================
    
    // Endpoint per la gestione delle informazioni dell'utente
    router.get("/user/info", await authenticateUser, getUserInfoController()); // Recupera i dati del profilo
    router.put("/user/update", await authenticateUser, updateUserInfoController()); // Aggiorna i dati del profilo
    router.delete("/user/delete", await authenticateUser, deleteUserController()); // Elimina l'account
    
    // ==========================================
    // SEZIONE 3: GESTIONE CARTE
    // ==========================================
    
    // Endpoint per la gestione delle carte dell'utente
    router.get("/user/cards/search", await authenticateUser, searchUserCardsController()); // Cerca carte specifiche
    router.get("/user/cards/missing", await authenticateUser, getUserMissingCardsController()); // Lista carte mancanti
    router.get("/user/cards/double", await authenticateUser, getUserDoubleCardsController()); // Lista carte duplicate
    router.post("/user/cards/sell", await authenticateUser, sellUserCardsController()); // Vende carte per crediti
    
    // ==========================================
    // SEZIONE 4: GESTIONE PACCHETTI E ECONOMIA
    // ==========================================
    
    // Endpoint per la gestione dei pacchetti e dell'economia del gioco
    router.post("/user/cards/package/open", await authenticateUser, openPackageCardsUserController()); // Apre un pacchetto di carte
    router.post("/user/credits/buy", await authenticateUser, buyCreditUserController()) // Acquista crediti di gioco
    
    // ==========================================
    // SEZIONE 5: GESTIONE SCAMBI
    // ==========================================
    
    // Endpoint per la gestione degli scambi tra utenti
    router.get("/user/my-trades", await authenticateUser, getUserAllTrades()) // Visualizza gli scambi dell'utente

    // Middleware per la gestione degli scambi
    router.use(checkExpiredTrades); // Controlla e gestisce gli scambi scaduti
    router.post("/trade/create", await authenticateUser, createTradeController()); // Crea una nuova proposta di scambio
    router.get("/trade/all", await authenticateUser, getAllTradesController()); // Lista tutti gli scambi disponibili
    router.post("/trade/accept", await authenticateUser, acceptTradeController()); // Accetta una proposta di scambio
    router.delete("/trade/delete", await authenticateUser, deleteTradeController()); // Elimina una proposta di scambio

    return router;
};