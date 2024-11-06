import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  apiKeys: {
    exchange: String,
    secretKey: String
  },
  settings: {
    riskPerTrade: {
      type: Number,
      default: 1 // percentage
    },
    maxOpenTrades: {
      type: Number,
      default: 3
    },
    tradingPairs: [{
      type: String,
      enum: ['BTC/USD', 'ETH/USD', 'XAU/USD', 'XAG/USD']
    }]
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);