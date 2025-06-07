import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const blacklistSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: process.env.JWT_EXPIRATION,
        default: Date.now
    }
});

const blacklistModel = mongoose.model('blacklist', blacklistSchema);
export default blacklistModel;
