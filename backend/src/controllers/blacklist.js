import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Blacklist = mongoose.model('blacklist', blacklistSchema);
export default Blacklist;
