import mongoose from "mongoose";

const BankAccountSchema = new mongoose.Schema(
  {
    // userId: {
    //   type: String,
    //   required: true,
    // },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    reAccountNumber: { type: String, required: true },
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    ifscCode: { type: String, required: true },
  },
  { timestamps: true }
);

const BankAccount = mongoose.model("BankAccount", BankAccountSchema);
export default BankAccount;
