/**
 * File per la gestione degli scambi scaduti
 * Questo file contiene un middleware che verifica e aggiorna automaticamente
 * lo stato degli scambi scaduti nel database
 */

import { tradeModel } from '../models/trade.js';

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
    try {
        const now = new Date();
        // Aggiorna tutti gli scambi aperti che hanno superato la data di scadenza
        await tradeModel.updateMany(
            {
                status: "open",
                expirateAt: { $lte: now }
            },
            {
                $set: { status: "expired" }
            }
        );
        next();
    } catch (error) {
        console.error('Error checking expired trades:', error);
        next(); // Continua anche se c'è un errore per non bloccare l'applicazione
    }
};
