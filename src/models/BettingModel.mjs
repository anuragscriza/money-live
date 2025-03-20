// src/models/BettingModel.mjs
import { Schema, model } from 'mongoose';

const BettingSchema = new Schema({
    userId: { type: Number, required: true },
    betting_id: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    character: [{
        character_id: { type: String, required: true },
        amount: { type: Number, required: true },
        win_amount: { type: Number, default: 0 },
        status: { type: String, default: "BetApplied" },
    }],
    // userId: { type: Number, required: true },
    // userName: { type: String, required: true },
    // amount: { type: Number, required: true },
    // winAmount: { type: Number, default: 0 },
    weightage: { type: Number, default: 0 },
    game_status: { type: String, default: "pending" }
}, { timestamps: true });

BettingSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
    }
});

BettingSchema.pre('save', function (next) {
    if (this.amount !== 0) {
        this.weightage = ((this.winAmount - this.amount) / this.amount) * 100;
    } else {
        this.weightage = 0;
    }
    next();
});

export default model('UserBetting', BettingSchema);