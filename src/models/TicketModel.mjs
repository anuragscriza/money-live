import mongoose from "mongoose";

// Define the ticket schema
const ticketSchema = new mongoose.Schema(
  {
    issueType: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    ticketId: {
      type: String,
      default: () => Math.floor(100000 + Math.random() * 900000),
    },
    status: { type: String, default: "Open" },
    userId: { type: Number, require: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Create the Ticket model based on the schema
const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
