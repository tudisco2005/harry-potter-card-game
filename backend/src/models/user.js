// user model
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    favouriteWizard: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    paymentInfo: {
        cardNumber: {
            type: String,
            required: false,
            trim: true
        },
        expiryDate: {
            type: String,
            required: false,
            trim: true
        },
        cvv: {
            type: String,
            required: false,
            trim: true
        },
    },
    balance: {
        type: Number,
        default: 0
    },
    game_cards: {
        type: [{
            cardId: {
                type: String,
                required: true,
                trim: true
            },
            quantity: {
                type: Number,
                default: 0
            }
        }],
        default: []
    },
    trades: {
        type: [String],
        default: []
    }
});

const userModel = mongoose.model('users', userSchema);

export default userModel;