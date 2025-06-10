import { userModel } from '../models/user.js';
import { tradeModel } from '../models/trade.js';

// Costanti per gli stati degli scambi
const TRADE_STATUS = {
    ACTIVE: 'open',             // scambio attivo e disponibile
    COMPLETED: 'completed',     // scambio completato con successo
    CANCELLED: 'cancelled',     // scambio annullato dall'utente
    EXPIRED: 'expired'          // scambio scaduto automaticamente
};

// Funzione per validare i dati di input di uno scambio
const validateTradeInput = (offeredCards, requestedCards, expireTime) => {
    const errors = [];

    // Verifica che ci siano carte offerte e richieste
    if (!offeredCards?.length || !requestedCards?.length) {
        errors.push("Devi offrire e richiedere almeno una carta");
    }

    // Verifica che la data di scadenza sia valida
    if (!expireTime || isNaN(new Date(expireTime).getTime())) {
        errors.push("Data di scadenza non valida");
    }

    return errors;
};

/**
 * @swagger
 * /api/trade/create:
 *   post:
 *     tags:
 *       - Scambi
 *     summary: Crea un nuovo scambio
 *     description: Crea una nuova proposta di scambio di carte
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offeredCards
 *               - requestedCards
 *               - expireTime
 *             properties:
 *               offeredCards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               requestedCards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               expireTime:
 *                 type: string
 *                 format: date-time
 *                 description: Data di scadenza dello scambio
 *     responses:
 *       201:
 *         description: Scambio creato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trade:
 *                   type: object
 *       400:
 *         description: Dati non validi o mancanti
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore del server
 */
export const createTradeController = () => {
    return async function createTrade(req, res) {
        try {
            const userId = req.userId;
            console.log("[-] Recupero informazioni utente in corso:", userId);

            // Verifica che l'utente esista
            const user = await userModel.findOne({ _id: userId });
            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            const { offeredCards, requestedCards, expireTime } = req.body;
            console.log("[-] Creazione scambio in corso...");

            // Validazione dei dati di input
            const validationErrors = validateTradeInput(offeredCards, requestedCards, expireTime);
            if (validationErrors.length > 0) {
                console.log("[-] Dati di scambio non validi:", validationErrors[0]);
                return res.status(400).send({ message: validationErrors[0] });
            }

            // Normalizzazione delle quantità delle carte (impostate a 1)
            const normalizedOfferedCards = offeredCards.map(card => ({ ...card, quantity: 1 }));
            const normalizedRequestedCards = requestedCards.map(card => ({ ...card, quantity: 1 }));

            // Creazione del nuovo scambio nel database
            const trade = new tradeModel({
                userIdOffer: userId,
                offered_cardIds: normalizedOfferedCards,
                requested_cardIds: normalizedRequestedCards,
                expirateAt: new Date(expireTime),
                status: TRADE_STATUS.ACTIVE
            });

            // Salvataggio dello scambio e aggiornamento dell'utente
            const savedTrade = await trade.save();
            user.trades.push(savedTrade._id);
            await user.save();

            console.log("[+] Scambio creato con successo:", savedTrade._id);
            return res.status(201).send({
                message: "Scambio creato con successo",
                trade: savedTrade
            });

        } catch (error) {
            console.error("[-] Errore durante la creazione dello scambio:", error);
            return res.status(500).send({ message: "Errore durante la creazione dello scambio" });
        }
    }
};

/**
 * @swagger
 * /api/trade/all:
 *   get:
 *     tags:
 *       - Scambi
 *     summary: Ottieni tutti gli scambi disponibili
 *     description: Recupera tutti gli scambi attivi tranne quelli dell'utente autenticato
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista degli scambi recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trades:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userIdOffer:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                       offered_cardIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                       requested_cardIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                       expirateAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Errore del server
 */
export const getAllTradesController = () => {
    return async function getAllTrades(req, res) {
        console.log("[-] Recupero tutti gli scambi in corso tranne i completati o cancellati");

        try {
            // Recupera tutti gli scambi attivi escludendo quelli dell'utente corrente
            const trades = await tradeModel.find({
                status: { $in: [TRADE_STATUS.ACTIVE] },
                userIdOffer: { $ne: req.userId },
                expirateAt: { $gt: new Date() }
            }).populate('userIdOffer', 'username').populate('userIdBuyer', 'username');

            console.log("[-] Scambi recuperati con successo:", trades.length);

            // Aggiunge informazioni aggiuntive per ogni scambio
            const tradesWithOffererInfo = await Promise.all(trades.map(async (trade) => {
                const tradeObj = trade.toObject();
                const userOffer = await userModel.findById(trade.userIdOffer);

                if (userOffer) {
                    console.log("[-] Informazioni offerente trovate per lo scambio:", trade._id);

                    // Recupera gli scambi completati dell'utente
                    const userTrades = await tradeModel.find({ 
                        userIdOffer: userOffer._id,
                        status: TRADE_STATUS.COMPLETED 
                    });
                    const completedTrades = userTrades.length;
                    const totalTrades = await tradeModel.countDocuments({ userIdOffer: userOffer._id });
                    
                    // Calcola le statistiche dell'offerente
                    tradeObj.offererInfo = {
                        username: userOffer.username,
                        userInitials: userOffer.username.split(' ').map(word => word.charAt(0).toUpperCase()).join(''),
                        totalTrades: totalTrades,
                        completedTrades,
                        rating: (totalTrades > 0 ? (completedTrades / totalTrades) * 5 : 0).toFixed(1)
                    };
                } else {
                    console.log("[-] Utente offerente non trovato per lo scambio:", trade._id);
                    res.status(404).send({ message: "Utente offerente non trovato" });
                    return null; // Salta questo scambio se l'offerente non è trovato
                }

                return tradeObj;
            }));

            console.log("[-] Scambi con informazioni offerente recuperati con successo:", tradesWithOffererInfo.length);

            return res.status(200).send({
                message: "Scambi recuperati con successo",
                trades: tradesWithOffererInfo
            });

        } catch (error) {
            console.error("[-] Errore durante il recupero degli scambi:", error);
            return res.status(500).send({ message: "Errore durante il recupero degli scambi" });
        }
    }
};

/**
 * @swagger
 * /api/trade/accept:
 *   post:
 *     tags:
 *       - Scambi
 *     summary: Accetta uno scambio
 *     description: Accetta una proposta di scambio di carte
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tradeId
 *             properties:
 *               tradeId:
 *                 type: string
 *                 description: ID dello scambio da accettare
 *     responses:
 *       200:
 *         description: Scambio accettato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Dati non validi o mancanti
 *       403:
 *         description: Non autorizzato ad accettare questo scambio
 *       404:
 *         description: Scambio non trovato
 *       500:
 *         description: Errore del server
 */
export const acceptTradeController = () => {
    return async function acceptTrade(req, res) {
        const { tradeId } = req.body;
        const userId = req.userId;

        console.log("[-] Accettazione Scambio in corso:", tradeId);

        try {
            // Verifica che lo scambio esista e sia attivo
            const trade = await tradeModel.findOne({ _id: tradeId, userIdOffer: { $ne: userId }, status: "open" });

            if (!trade) {
                console.log("[-] Scambio non trovato o cancellato");
                return res.status(404).send({ message: "Scambio non trovato o cancellato" });
            }

            // Recupera gli utenti coinvolti nello scambio
            const userOffer = await userModel.findOne({ _id: trade.userIdOffer });
            const userBuyer = await userModel.findOne({ _id: userId });

            if (!userOffer) {
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
                        console.log("[-] Quantità insufficiente per la carta:", card.id, card.name);
                        return res.status(400).send({ message: "Quantità offerta insufficiente per la carta: " + card.name });
                    }
                    console.log("[-] Offerente: Rimuovo carta offerta:", card.id, "Quantità:", card.quantity);
                    existingCard.quantity -= card.quantity;
                } else {
                    console.log("[-] Carta offerta non trovata:", card.id, card.name);
                    return res.status(404).send({ message: "Carta offerta non trovata: " + card.name });
                }
            }

            // Rimuove le carte richieste dall'utente compratore
            for (const card of trade.requested_cardIds) {
                const existingCard = userBuyer.game_cards.find(c => c.id === card.id);
                if (existingCard) {
                    if (existingCard.quantity < card.quantity) {
                        console.log("[-] Quantità insufficiente per la carta richiesta:", card.id, card.name);
                        return res.status(400).send({ message: "Quantità insufficiente per la carta richiesta: " + card.name });
                    }
                    console.log("[-] Compratore: Rimuovo carta richiesta:", card.id, "Quantità:", card.quantity);
                    existingCard.quantity -= card.quantity;
                } else {
                    console.log("[-] Carta richiesta non trovata:", card.id, card.name);
                    return res.status(404).send({ message: "Carta richiesta non trovata: " + card.name });
                }
            }

            // Aggiunge le carte offerte all'utente compratore
            for (const card of trade.offered_cardIds) {
                const existingCard = userBuyer.game_cards.find(c => c.id === card.id);
                if (existingCard) {
                    console.log("[-] Compratore: Aggiungo carta offerta:", card.id, "Quantità:", card.quantity);
                    existingCard.quantity += card.quantity;
                } else {
                    console.log("[-] Carta offerta non trovata per l'utente compratore:", card.id, card.name);
                    return res.status(404).send({ message: "Carta offerta non trovata per l'utente compratore: " + card.name });
                }
            }

            // Aggiunge le carte richieste all'utente offerente
            for (const card of trade.requested_cardIds) {
                const existingCard = userOffer.game_cards.find(c => c.id === card.id, card.name);
                if (existingCard) {
                    console.log("[-] Offerente: Aggiungo carta richiesta:", card.id, "Quantità:", card.quantity);
                    existingCard.quantity += card.quantity;
                } else {
                    console.log("[-] Carta richiesta non trovata per l'utente offerente:", card.id, card.name);
                    return res.status(404).send({ message: "Carta richiesta non trovata per l'utente offerente: " + card.name });
                }
            }

            // Aggiorna lo stato dello scambio e salva le modifiche
            trade.userIdBuyer = userId;
            trade.status = "completed";

            await userOffer.save();
            await userBuyer.save();
            await trade.save();

            console.log("[-] Scambio accettato con successo:", tradeId);
            return res.status(200).send({ message: "Scambio accettato con successo", trade });
        } catch (error) {
            console.error("[-] Errore durante l'accettazione del scambio:", error);
            return res.status(500).send({ message: "Errore Server" });
        }
    }
};

/**
 * @swagger
 * /api/trade/delete:
 *   delete:
 *     tags:
 *       - Scambi
 *     summary: Elimina uno scambio
 *     description: Elimina una proposta di scambio di carte
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tradeId
 *             properties:
 *               tradeId:
 *                 type: string
 *                 description: ID dello scambio da eliminare
 *     responses:
 *       200:
 *         description: Scambio eliminato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Non autorizzato ad eliminare questo scambio
 *       404:
 *         description: Scambio non trovato
 *       500:
 *         description: Errore del server
 */
export const deleteTradeController = () => {
    return async function deleteTrade(req, res) {
        try {
            // Recupera l'utente dal database
            const user = await userModel.findOne({ _id: req.userId }).catch((error) => {
                console.error("[-] Errore durante il recupero dell'utente:", error);
                throw error;
            });

            if (!user) {
                console.log("[-] Utente non trovato");
                return res.status(404).send({ message: "Utente non trovato" });
            }

            // Verifica che lo scambio esista e sia attivo
            const { tradeId } = req.body;
            const trade = await tradeModel.findOne({ _id: tradeId, status: "open" });

            if (!trade) {
                console.log("[-] Scambio non trovato o gia completato");
                return res.status(404).send({ message: "Scambio non trovato o gia completato" });
            }

            // Verifica che l'utente sia autorizzato a cancellare lo scambio
            if (trade.userIdOffer.toString() !== req.userId) {
                console.log("[-] L'utente non è autorizzato a cancellare questo scambio");
                return res.status(403).send({ message: "Non sei autorizzato a cancellare questo scambio" });
            }

            // Cancella il scambio impostando lo status su "cancelled"
            trade.status = "cancelled";
            await trade.save();

            console.log("[-] Scambio cancellato con successo:", tradeId);
            return res.status(200).send({ message: "Scambio cancellato con successo" });
        } catch (error) {
            console.error("[-] Errore durante la cancellazione del scambio:", error);
            return res.status(500).send({ message: "Errore Server" });
        }
    }
};

/**
 * @swagger
 * /api/search-trades:
 *   get:
 *     tags:
 *       - Scambi
 *     summary: Cerca gli scambi disponibili in base al nome della carta
 *     description: Recupera gli scambi attivi ordinandoli per data di creazione o scadenza, con la possibilità di filtrare per nome carta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: Query di ricerca per nome carta
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [recent, expiring]
 *         description: Metodo di ordinamento
 *     responses:
 *       200:
 *         description: Lista degli scambi recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trades:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Errore del server
 */
export const searchTradesController = () => {
    return async function searchTrades(req, res) {
        try {
            const { searchQuery, sortBy } = req.query;
            let query = {};
            let sort = {};

            // Query base per gli scambi attivi
            const baseQuery = {
                status: { $in: [TRADE_STATUS.ACTIVE] },
                userIdOffer: { $ne: req.userId },
                expirateAt: { $gt: new Date() }
            };

            // Aggiunge filtri di ricerca se presenti
            if (searchQuery && searchQuery.trim()) {
                const searchRegex = new RegExp(searchQuery.trim(), 'i');

                // Cerca negli scambi dove almeno una carta offerta ha un nome che corrisponde alla query
                query = {
                    ...baseQuery,
                    $or: [
                        // Ricerca nel nome delle carte offerte
                        { 'offered_cardIds.name': { $regex: searchRegex } },
                        // Ricerca nei nomi alternativi delle carte offerte
                        { 'offered_cardIds.alternate_names': { $regex: searchRegex } },
                        // Opzionalmente, cerca anche nelle carte richieste
                        // { 'requested_cardIds.name': { $regex: searchRegex } },
                        // { 'requested_cardIds.alternate_names': { $regex: searchRegex } }
                    ]
                };
            } else {
                query = baseQuery;
                console.log("[-] Nessuna query di ricerca fornita, recupero tutti gli scambi attivi");
            }

            // Imposta l'ordinamento dei risultati
            if (sortBy === 'recent') {
                sort = { expirateAt: -1 };
            } else if (sortBy === 'expiring') {
                sort = { expirateAt: 1 };
            } else {
                sort = { _id: -1 };
            }

            // Esegue la ricerca
            console.log("[-] Ricerca Scambi in corso con query:", searchQuery !== "" ? searchQuery : "undefined", "e ordinamento:", sortBy);
            const trades = await tradeModel.find(query)
                .sort(sort)
                .populate('userIdOffer', 'username')
                .populate('userIdBuyer', 'username');

            // Filtra ulteriormente i risultati se necessario
            let filteredTrades = trades;
            if (searchQuery && searchQuery.trim()) {
                const searchTerm = searchQuery.trim().toLowerCase();

                filteredTrades = trades.filter(trade => {
                    // Verifica se almeno una carta offerta contiene il termine di ricerca
                    const offeredMatch = trade.offered_cardIds.some(card =>
                        card.name.toLowerCase().includes(searchTerm) ||
                        (card.alternate_names && card.alternate_names.some(altName =>
                            altName.toLowerCase().includes(searchTerm)
                        ))
                    );

                    // Verifica se almeno una carta richiesta contiene il termine di ricerca
                    // const requestedMatch = trade.requested_cardIds.some(card => 
                    //     card.name.toLowerCase().includes(searchTerm) ||
                    //     (card.alternate_names && card.alternate_names.some(altName => 
                    //         altName.toLowerCase().includes(searchTerm)
                    //     ))
                    // );

                    return offeredMatch // || requestedMatch;
                });

                console.log("[-] Filtro applicato. Scambi prima del filtro:", trades.length, "dopo:", filteredTrades.length);
            }

            // Aggiunge informazioni sugli offerenti
            const tradesWithOffererInfo = await Promise.all(filteredTrades.map(async (trade) => {
                const tradeObj = trade.toObject();
                const userOffer = await userModel.findById(trade.userIdOffer);

                const userTrades = await tradeModel.find({ 
                    userIdOffer: userOffer._id,
                    status: TRADE_STATUS.COMPLETED 
                });
                const completedTrades = userTrades.length;
                const totalTrades = await tradeModel.countDocuments({ userIdOffer: userOffer._id });

                if (userOffer) {
                    tradeObj.offererInfo = {
                        username: userOffer.username,
                        userInitials: userOffer.username.split(' ').map(word => word.charAt(0).toUpperCase()).join(''),
                        totalTrades,
                        completedTrades,
                        rating: (totalTrades > 0 ? (completedTrades / totalTrades) * 5 : 0).toFixed(1)
                    };
                } else {
                    console.log("[-] Utente offerente non trovato per lo scambio:", trade._id);
                    // Non restituire errore, ma saltare questo scambio
                    return null;
                }

                return tradeObj;
            }));

            // Rimuove gli scambi con utenti non trovati
            const validTrades = tradesWithOffererInfo.filter(trade => trade !== null);

            console.log("[-] Ricerca Scambi completata. Scambi trovati:", validTrades.length);

            return res.status(200).send({
                message: searchQuery ?
                    `Trovati ${validTrades.length} scambi per "${searchQuery}"` :
                    "Scambi recuperati con successo",
                trades: validTrades,
            });

        } catch (error) {
            console.error("[-] Errore durante la ricerca degli scambi:", error);
            return res.status(500).send({
                message: "Errore durante la ricerca degli scambi",
                error: error.message
            });
        }
    }
};
