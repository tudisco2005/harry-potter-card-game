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

        console.log("[-] Accettazione Scambio in corso:", tradeId);

        try {
            const trade = await tradeModel.findOne({ _id: tradeId, userIdOffer: { $ne: userId }, status: "open" });

            if (!trade) {
                console.log("[-] Trade non trovato o cancellato");
                return res.status(404).send({ message: "Trade non trovato o cancellato" });
            }


            // modifica le carte degli utenti coinvolti
            const userOffer = await userModel.findOne({ _id: trade.userIdOffer });
            const userBuyer = await userModel.findOne({ _id: userId });

            if(!userOffer) {
                console.log("[-] Utente offerente non trovato");
                return res.status(404).send({ message: "Utente offerente o compratore non trovato" });
            }

            if (!userBuyer) {
                console.log("[-] Utente compratore non trovato");
                return res.status(404).send({ message: "Utente offerente o compratore non trovato" });
            }


            // Rimuovi le carte offerte dall'utente offerente modificando la quantità posseduta
            for (const card of trade.offered_cardIds) {
                const existingCard = userOffer.game_cards.find(c => c.id === card.id);
                if (existingCard) {
                    if (existingCard.quantity < card.quantity) {
                        console.log("[-] Quantità insufficiente per la carta:", card.id);
                        return res.status(400).send({ message: "Quantità offerta insufficiente per la carta: " + card.id });
                    }
                    console.log("[-] Offerente: Rimuovo carta offerta:", card.id, "Quantità:", card.quantity);
                    existingCard.quantity -= card.quantity;
                } else {
                    console.log("[-] Carta offerta non trovata:", card.id);
                    return res.status(404).send({ message: "Carta offerta non trovata: " + card.id });
                }
            }

            // Rimuovi le carte richieste dall'utente compratore modificando la quantità posseduta
            for (const card of trade.requested_cardIds) {
                const existingCard = userBuyer.game_cards.find(c => c.id === card.id);
                if (existingCard) {
                    if (existingCard.quantity < card.quantity) {
                        console.log("[-] Quantità insufficiente per la carta richiesta:", card.id);
                        return res.status(400).send({ message: "Quantità insufficiente per la carta richiesta: " + card.id });
                    }
                    console.log("[-] Compratore: Rimuovo carta richiesta:", card.id, "Quantità:", card.quantity);
                    existingCard.quantity -= card.quantity;
                } else {
                    console.log("[-] Carta richiesta non trovata:", card.id);
                    return res.status(404).send({ message: "Carta richiesta non trovata: " + card.id });
                }
            }

            // Aggiungi le carte offerte all'utente compratore modificando la quantità posseduta
            for (const card of trade.offered_cardIds) {
                const existingCard = userBuyer.game_cards.find(c => c.id === card.id);
                if (existingCard) {
                    console.log("[-] Compratore: Aggiungo carta offerta:", card.id, "Quantità:", card.quantity);
                    existingCard.quantity += card.quantity;
                } else {
                    console.log("[-] Carta offerta non trovata per l'utente compratore:", card.id);
                    return res.status(404).send({ message: "Carta offerta non trovata per l'utente compratore: " + card.id });
                }
            }

            // Aggiungi le carte richieste all'utente offerente modificando la quantità posseduta
            for (const card of trade.requested_cardIds) {
                const existingCard = userOffer.game_cards.find(c => c.id === card.id);
                if (existingCard) {
                    console.log("[-] Offerente: Aggiungo carta richiesta:", card.id, "Quantità:", card.quantity);
                    existingCard.quantity += card.quantity;
                } else {
                    console.log("[-] Carta richiesta non trovata per l'utente offerente:", card.id);
                    return res.status(404).send({ message: "Carta richiesta non trovata per l'utente offerente: " + card.id });
                }
            }
            // Salva le modifiche agli utenti
            trade.userIdBuyer = userId;
            trade.status = "completed";

            await userOffer.save();
            await userBuyer.save();
            await trade.save();

            console.log("[-] Scambio accettato con successo:", tradeId);
            return res.status(200).send({ message: "Trade accettato con successo", trade });
        } catch (error) {
            console.error("[-] Errore durante l'accettazione del trade:", error);
            return res.status(500).send({ message: "Errore Server" });
        }
    }

    return { acceptTrade };
}

export const deleteTradeController = (mongodb) => {
    return async function deleteTrade(req, res) {
        try {
            // Recupera le informazioni dell'utente dal database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero dell'utente:", error);
                throw error; // Rilancia l'errore invece di inviare la risposta qui
            });

            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            //controlla se il trade è dell utente
            const { tradeId } = req.body;
            const trade = await tradeModel.findOne({ _id: tradeId, status: "open"});

            if (!trade) {
                console.log("[-] Trade non trovato o gia completato");
                return res.status(404).send({ message: "Trade non trovato o gia completato" });
            }

            if (trade.userIdOffer.toString() !== req.userId) {
                console.log("[-] L'utente non è autorizzato a cancellare questo trade");
                return res.status(403).send({ message: "Non sei autorizzato a cancellare questo trade" });
            }

            // Cancella il trade impostando lo status su "cancelled"
            trade.status = "cancelled";
            await trade.save();

            console.log("[-] Trade cancellato con successo:", tradeId);
            return res.status(200).send({ message: "Trade cancellato con successo" });
        } catch (error) {
            console.error("[-] Errore durante la cancellazione del trade:", error);
            return res.status(500).send({ message: "Errore Server" });
        }
    }
}