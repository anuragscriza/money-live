// // src/models/BettingModel.mjs
// import { Schema, model } from 'mongoose';

// const BettingSchema = new Schema({
//     userId: { type: Number, required: true },
//     bettingId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
//     gameId: { type: Number, required: true },
//     userName: { type: String, required: true },
//     characterId: { type: Number, required: true },
//     betAmount: { type: Number, required: true },
//     winAmount: { type: Number, default: 0 },
//     characterStatus: { type: String, default: null },
//     gameStatus: { type: String, default: "pending" }
// }, { timestamps: true });

// BettingSchema.set('toJSON', {
//     virtuals: true,
//     transform: (doc, ret) => {
//         ret.createdAt = ret.createdAt.toISOString();
//         ret.updatedAt = ret.updatedAt.toISOString();
//     }
// });

// BettingSchema.pre('save', function (next) {
//     if (this.amount !== 0) {
//         this.weightage = ((this.winAmount - this.amount) / this.amount) * 100;
//     } else {
//         this.weightage = 0;
//     }
//     next();
// });

// export default model('UserBetting', BettingSchema);

// src/models/BettingModel.mjs
import { Schema, model } from 'mongoose';

const BettingSchema = new Schema({
    userId: { type: Number, required: true },
    bettingId: { type: Number, required: true },
    gameId: { type: Number, required: false, default: null },
    userName: { type: String, required: true },
    characterId: { type: Number, required: true },
    betAmount: { type: Number, required: true },
    winAmount: { type: Number, default: 0 },
    characterStatus: { type: String, default: null },
    gameStatus: { type: String, default: "pending" },
    dateTime: { type: Date, default: Date.now }  // Added dateTime field
}, { timestamps: true });

BettingSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        ret.dateTime = ret.dateTime.toISOString();  // Convert dateTime to ISO string when returned
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
