import mongoose from "mongoose";
import { gameCardSchema } from "./user.js";

const tradeSchema = new mongoose.Schema({
    userIdOffer: {
        type: String,
        required: true,
        trim: true
    },
    userIdBuyer: {
        type: String,
        trim: true
    },
    offered_cardIds: {
        type: [gameCardSchema],
        required: true,
        trim: true
    },
    requested_cardIds: {
        type: [gameCardSchema],
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["open", "completed", "cancelled", "expired"],
        default: "open"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
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