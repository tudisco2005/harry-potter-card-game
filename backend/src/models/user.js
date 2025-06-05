// user model
import mongoose from 'mongoose';

const wandSchema = new mongoose.Schema({
  wood: {
    type: String,
    default: ""
  },
  core: {
    type: String,
    default: ""
  },
  length: {
    type: Number,
    default: null
  }
}, { _id: false });

const gameCardSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  alternate_names: [{
    type: String,
    trim: true
  }],
  species: {
    type: String,
    default: 'human',
    lowercase: true,
    trim: true
  },
  gender: {
    type: String,
    lowercase: true,
    default: ""
  },
  house: {
    type: String,
    default: ""
  },
  dateOfBirth: {
    type: String,
    default: "",
  },
  yearOfBirth: {
    type: Number,
    min: 1000,
    max: 3000,
    default: null
  },
  wizard: {
    type: Boolean,
    default: false
  },
  ancestry: {
    type: String,
    lowercase: true,
    default: ""
  },
  eyeColour: {
    type: String,
    default: "",
    lowercase: true,
    trim: true
  },
  hairColour: {
    type: String,
    default: "",
    lowercase: true,
    trim: true
  },
  wand: {
    type: wandSchema,
    default: () => ({})
  },
  patronus: {
    type: String,
    default: "",
    lowercase: true,
    trim: true
  },
  hogwartsStudent: {
    type: Boolean,
    default: false
  },
  hogwartsStaff: {
    type: Boolean,
    default: false
  },
  actor: {
    type: String,
    default: "",
    trim: true
  },
  alternate_actors: [{
    type: String,
    trim: true
  }],
  alive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: "",
    validate: {
      validator: function(v) {
        return v === "" || /^https?:\/\/.+/.test(v);
      },
      message: 'Image must be a valid URL or empty string'
    }
  }
}, { _id: false });

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
    // paymentInfo: {
    //     cardNumber: {
    //         type: String,
    //         required: false,
    //         trim: true
    //     },
    //     expiryDate: {
    //         type: String,
    //         required: false,
    //         trim: true
    //     },
    //     cvv: {
    //         type: String,
    //         required: false,
    //         trim: true
    //     },
    // },
    balance: {
        type: Number,
        default: 0
    },
    game_cards: {
        type: [gameCardSchema],
        default: []
    },
    trades: {
        type: [String],
        default: []
    }
});

const userModel = mongoose.model('users', userSchema);

export { userModel, gameCardSchema};