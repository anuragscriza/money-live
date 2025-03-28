import mongoose from "mongoose";

// Schema definition
const UpiModelSchema = new mongoose.Schema(
  {
    upiId: {
      type: Number,
      default: () => Math.floor(100000 + Math.random() * 900000),
      unique: true,
    },
    accountName: {
      type: String,
      required: [true, "AccountName is required"], // Fixed typo
    },
    fatherName: {
      type: String,
      required: [true, "FathersName is required"], // Fixed typo
    },
    address: {
      type: String,
      required: [true, "address is required"], // Fixed typo
    },
    AccountType: {
      type: String,
      required: [true, "AccountType is required"], // Fixed typo
    },
    Identifier: {
      // Fixed typo: 'Identifer' to 'Identifier'
      type: String,
      required: [true, "Identifier is required"], // Fixed typo
    },
  },
  { timestamps: true }
);

export default mongoose.model("UpiModel", UpiModelSchema);
