// middleware/checkExpiredTrades.js
import { tradeModel } from '../models/trade.js';

export const checkExpiredTrades = async (req, res, next) => {
    try {
        const now = new Date();
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
        next(); // Continua anche se c'è un errore
    }
};
