/**
 * File per la gestione degli scambi scaduti
 * Questo file contiene un middleware che verifica e aggiorna automaticamente
 * lo stato degli scambi scaduti nel database
 */

import { tradeModel } from '../models/trade.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // 1 secondo

/**
 * Funzione di utilità per il delay
 * @param {number} ms - Millisecondi di attesa
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Middleware per la verifica e l'aggiornamento degli scambi scaduti
 * Questo middleware viene eseguito prima di ogni richiesta e aggiorna
 * lo stato degli scambi aperti che hanno superato la data di scadenza
 * 
 * @param {Object} req - Oggetto request Express
 * @param {Object} res - Oggetto response Express
 * @param {Function} next - Funzione next Express
 */
export const checkExpiredTrades = async (req, res, next) => {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
        try {
            const now = new Date();
            // Aggiorna tutti gli scambi aperti che hanno superato la data di scadenza
            const result = await tradeModel.updateMany(
                {
                    status: "open",
                    expirateAt: { $lte: now }
                },
                {
                    $set: { status: "expired" }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[+] ${result.modifiedCount} scambi scaduti aggiornati con successo`);
            }
            
            next();
            return;
        } catch (error) {
            retries++;
            console.error(`[-] Tentativo ${retries}/${MAX_RETRIES} fallito durante il controllo degli scambi scaduti:`, error);
            
            if (retries === MAX_RETRIES) {
                console.error("[-] Numero massimo di tentativi raggiunto per il controllo degli scambi scaduti");
                // Invia una risposta di errore al client
                return res.status(500).send({ 
                    message: "Errore interno del server durante l'aggiornamento degli scambi",
                    error: "Errore di aggiornamento scambi"
                });
            }
            
            // Attendi prima del prossimo tentativo
            await delay(RETRY_DELAY * retries);
        }
    }
};
