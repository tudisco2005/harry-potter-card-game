import mongoose from "mongoose";
import { gameCardSchema } from "./user.js";

// Schema per gli scambi di carte
const tradeSchema = new mongoose.Schema({
    // ID dell'utente che offre lo scambio
    userIdOffer: {
        type: String,
        required: true,
        trim: true
    },
    // ID dell'utente che accetta lo scambio (opzionale finché non viene accettato)
    userIdBuyer: {
        type: String,
        trim: true
    },
    // Array di carte offerte per lo scambio
    offered_cardIds: {
        type: [gameCardSchema],
        required: true,
        trim: true
    },
    // Array di carte richieste in cambio
    requested_cardIds: {
        type: [gameCardSchema],
        required: true,
        trim: true
    },
    // Stato dello scambio: aperto, completato, cancellato o scaduto
    status: {
        type: String,
        enum: ["open", "completed", "cancelled", "expired"],
        default: "open"
    },
    // Data di creazione dello scambio
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Data di scadenza dello scambio
    expirateAt: {
        type: Date,
        required: true,
    },
});

// Middleware automatico per tutte le query
tradeSchema.pre(['find', 'findOne', 'findOneAndUpdate'], async function() {
    const now = new Date();
    await this.model.updateMany(
        { status: "open", expirateAt: { $lte: now } },
        { $set: { status: "expired" } }
    );
});

// Metodi helper
tradeSchema.methods.isExpired = function() {
    return this.expirateAt <= new Date();
};

tradeSchema.methods.checkAndExpire = async function() {
    if (this.status === 'open' && this.isExpired()) {
        this.status = 'expired';
        await this.save();
        return true;
    }
    return false;
};

tradeSchema.statics.updateExpired = function() {
    const now = new Date();
    return this.updateMany(
        { status: "open", expirateAt: { $lte: now } },
        { $set: { status: "expired" } }
    );
};

const tradeModel = mongoose.model("Trade", tradeSchema);

export { tradeModel };