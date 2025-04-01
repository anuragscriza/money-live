import mongoose from "mongoose";

const BankAccountSchema = new mongoose.Schema(
  {
    accountId: {
      type: Number,
      default: () => Math.floor(100000 + Math.random() * 900000),
      unique: true,
    },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    ifscCode: { type: String, required: true },
     userId:{type:Number,required:true}
  },
  { timestamps: true }
);

const BankAccount = mongoose.model("BankAccount", BankAccountSchema);
export default BankAccount;
