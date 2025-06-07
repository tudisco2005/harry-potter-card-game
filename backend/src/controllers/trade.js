import { userModel } from '../models/user.js';
import { tradeModel } from '../models/trade.js';

export const createTradeController = (mongodb) => {
    return async function createTrade(req, res) {
        let userId = req.userId;
        
        console.log("[-] Recupero informazioni utente in corso:", userId);
        const user = await userModel.findOne({ _id: userId }).catch((error) => {
            console.error("[-] Errore durante il recupero delle informazioni utente:", error);
            return res.status(500).send({ message: "Errore Server" });
        });
        
        if (!user) {
            console.log("[-] Utente non trovato");
            return res.status(404).send({ message: "Utente non trovato" });
        }
        
        const { offeredCards, requestedCards, expireTime } = req.body;
        console.log("[-] Creazione trade in corso:", offeredCards, requestedCards, expireTime);
        
        if (!offeredCards || !requestedCards || !expireTime) {
            console.log("[-] Dati di trade incompleti");
            return res.status(400).send({ message: "Dati di trade incompleti" });
        }

        // modifichiamo la quantita delle carte offerte e richieste si puo chiedere e offrire una singola carta per tipo
        offeredCards.forEach(card => {
            card.quantity = 1;
        })

        requestedCards.forEach(card => {
            card.quantity = 1;
        })


        const trade = new tradeModel({
            userIdOffer: userId,
            offered_cardIds: offeredCards,
            requested_cardIds: requestedCards,
            expirateAt: new Date(expireTime),
        });

        try {
            const savedTrade = await trade.save();
            
            // Aggiungi il trade all'array dei trades dell'utente
            user.trades.push(savedTrade._id);
            await user.save();

            console.log("[-] Trade creato con successo:", savedTrade._id);

            return res.status(201).send({
                message: "Trade creato con successo",
                trade: savedTrade
            });
        } catch (error) {
            console.error("[-] Errore durante la creazione del trade:", error);
            return res.status(500).send({ message: "Errore Server" });
        }
    }
};

export const getAllTradesController = (mongodb) => {
    return async function getAllTrades(req, res) {
        const userId = req.userId;
        console.log("[-] Recupero tutti i trades in corso tranne i completati o cancellati");
        
        try {
            const trades = await tradeModel.find({ 
                status: { $nin: ["completed", "cancelled"] },
                userIdOffer: { $ne: req.userId },
                expirateAt: { $gt: new Date() }
            }).populate('userIdOffer', 'username').populate('userIdBuyer', 'username');
            
            console.log("[-] Trades recuperati con successo:", trades.length);
            
            // Converti in array di oggetti plain e aggiungi offererInfo
            const tradesWithOffererInfo = [];
            
            for (const trade of trades) {
                const tradeObj = trade.toObject(); // Converte in plain object
                
                const userOffer = await userModel.findById(trade.userIdOffer);
                if (userOffer) {
                    console.log("[-] Informazioni offerente trovate per il trade:", trade._id);
                    tradeObj.offererInfo = {
                        username: userOffer.username,
                        userInitials: userOffer.username.split(' ').map(word => word.charAt(0).toUpperCase()).join(''),
                        totalTrades: userOffer.trades.length,
                        completedTrades: userOffer.trades.filter(t => t.status === "completed").length,
                        rating: userOffer.trades.filter(t => t.status === "completed").length > 0 
                            ? (userOffer.trades.filter(t => t.status === "completed").length / userOffer.trades.length) * 5 
                            : 0
                    };
                } else {
                    console.log("[-] Utente offerente non trovato per il trade:", trade._id);
                    tradeObj.offererInfo = { 
                        username: "Unknown", 
                        userInitials: "UN",
                        totalTrades: 0, 
                        completedTrades: 0, 
                        rating: 0 
                    };
                }
                
                tradesWithOffererInfo.push(tradeObj);
            }

            return res.status(200).send({
                message: "Trades recuperati con successo", 
                trades: tradesWithOffererInfo 
            });
        } catch (error) {
            console.error("[-] Errore durante il recupero dei trades:", error);
            return res.status(500).send({ message: "Errore Server" });
        }
    }
}

export const acceptTradeController = (mongodb) => {
    return async function acceptTrade(req, res) {
        const { tradeId } = req.body;
        const userId = req.userId;

        console.log("[-] Accettazione trade in corso:", tradeId);

        try {
            const trade = await tradeModel.findOne({ _id: tradeId, userIdOffer: { $ne: userId }, status: "open" });

            if (!trade) {
                console.log("[-] Trade non trovato o non autorizzato");
                return res.status(404).send({ message: "Trade non trovato o non autorizzato" });
            }

            trade.status = "completed";
            await trade.save();

            // modifica le carte degli utenti coinvolti
            const userOffer = await userModel.findById(trade.userIdOffer);
            const userBuyer = await userModel.findById(userId);

            if (!userOffer || !userBuyer) {
                console.log("[-] Utente offerente o compratore non trovato");
                return res.status(404).send({ message: "Utente offerente o compratore non trovato" });
            }

            // Rimuovi le carte offerte dall'utente offerente modificando la quantità posseduta
            for (const card of trade.offered_cardIds) {
                const existingCard = userOffer.cards.find(c => c.cardId === card.cardId);
                if (existingCard) {
                    if (existingCard.quantity <= card.quantity) {
                        console.log("[-] Quantità insufficiente per la carta:", card.cardId);
                        return res.status(400).send({ message: "Quantità offerta insufficiente per la carta: " + card.cardId });
                    }
                    existingCard.quantity -= card.quantity;
                }
            }

            // Aggiungi le carte richieste all'utente compratore modificanto la quantità posseduta
            for (const card of trade.requested_cardIds) {
                const existingCard = userBuyer.cards.find(c => c.cardId === card.cardId);
                if (existingCard) {
                    existingCard.quantity += card.quantity;
                } else {
                    userBuyer.cards.push(card);
                }
            }

            await userOffer.save();
            await userBuyer.save();

            console.log("[-] Trade accettato con successo:", tradeId);
            return res.status(200).send({ message: "Trade accettato con successo", trade });
        } catch (error) {
            console.error("[-] Errore durante l'accettazione del trade:", error);
            return res.status(500).send({ message: "Errore Server" });
        }
    }

    return { acceptTrade };
}