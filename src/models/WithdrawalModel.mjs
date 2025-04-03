// src/models/WithdrawalModel.mjs
import { Schema, model } from 'mongoose';

const BankDetailsSchema = {
    bankName: { type: String, required: true, trim: true, uppercase: true },
    accountNumber: { type: Number, required: true },
    ifscCode: { type: String, required: true, trim: true, uppercase: true },
    upiId: { type: String, required: true, trim: true },
    mobile: { type: Number, required: true }
};

const WithdrawalSchema = new Schema({
    withdrawalId: { type: Number, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    userId: { type: Number, required: true },
    //userName: { type: String, required: true },
    transactionId: { type: String, default: () => Math.floor(100000 + Math.random() * 900000), unique: true },
    amount: { type: Number, required: true },
    bankName: { type: String, required: true, trim: true, uppercase: true },
    accountNumber: { type: Number, required: true },
    ifscCode: { type: String, required: true, trim: true, uppercase: true },
    upiId: { type: String, required: false, default: null },
    status: { type: String, default: 'pending' }
}, { timestamps: true });

export default model('Withdrawal', WithdrawalSchema);
