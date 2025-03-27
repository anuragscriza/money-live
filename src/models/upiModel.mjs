import mongoose from "mongoose";

// Schema definition
const UpiModelSchema = new mongoose.Schema(
  {
    upiId: {
      type: String,
      required: [true, "upiId is required"], // Fixed typo
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
    // AccountType: {
    //   type: String,
    //   required: [true, "AccountType is required"], // Fixed typo
    // },
    // Identifier: {
    //   // Fixed typo: 'Identifer' to 'Identifier'
    //   type: String,
    //   required: [true, "Identifier is required"], // Fixed typo
    // },
    // UserId: {
    //   type: String,
    //   required: [true, "UserId is required"], // Fixed typo
    // },
  },
  { timestamps: true }
);

export default mongoose.model("UpiModel", UpiModelSchema);
