import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        trim: true
    },
    offered_cardIds: {
        type: [String],
        required: true,
        trim: true
    },
    requested_cardIds: {
        type: [String],
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
    }
});

const Trade = mongoose.model("Trade", tradeSchema);

export default Trade;
