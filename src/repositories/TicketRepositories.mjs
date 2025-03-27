import Ticket from "../models/TicketModel.mjs";
import mongoose from "mongoose";

class TicketRepository {
  // Method to create a new ticket
  static async createTicket(ticketData) {
    try {
      // Create a new ticket instance from the provided ticketData
      const newTicket = new Ticket(ticketData);

      // Save the new ticket to the database
      await newTicket.save();
      return newTicket; // Return the saved ticket
    } catch (error) {
      throw new Error("Error creating ticket: " + error.message); // Catch and throw any errors with a message
    }
  }

  // Method to get tickets by userId
  //   static async getTicketsById(id) {
  //     try {
  //       // Convert id to ObjectId if it's a valid MongoDB ObjectId
  //       if (!mongoose.Types.ObjectId.isValid(id)) {
  //         throw new Error("Invalid ticket ID format");
  //       }
  // console.log(id)
  //     const ticket = await Ticket.findById(new mongoose.Types.ObjectId(id));

  //       return ticket || null; // Return the ticket or null if not found
  //     } catch (error) {
  //       throw new Error("Error fetching ticket by ID: " + error.message);
  //     }
  //   }

  static async getTicketsById(userId) {
    // try {
    //static async getUserRecharge(userId) { return await Recharge.find({ userId: userId }).sort({ createdAt: -1 }); }
    return await Ticket.find({ userId: userId }).sort({ createdAt: -1 });
  }

  // Method to get tickets by issueType
  static async getTicketsByIssueType(issueType) {
    try {
      // Fetch tickets for the given issueType
      const tickets = await Ticket.find({ issueType });

      // Return the found tickets, or an empty array if no tickets are found
      return tickets.length > 0 ? tickets : [];
    } catch (error) {
      throw new Error("Error fetching tickets by issue type: " + error.message);
    }
  }

  // Method to get all tickets (optional)
  static async getAllTickets() {
    try {
      // Fetch all tickets
      const tickets = await Ticket.find();

      // Return the found tickets
      return tickets;
    } catch (error) {
      throw new Error("Error fetching all tickets: " + error.message);
    }
  }
}

export default TicketRepository;
