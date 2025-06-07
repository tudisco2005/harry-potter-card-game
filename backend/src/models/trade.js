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
        enum: ["open", "completed", "cancelled"],
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

const tradeModel = mongoose.model("Trade", tradeSchema);

export { tradeModel };
