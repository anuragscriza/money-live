import TicketRepository from "../repositories/TicketRepositories.mjs";

class TicketController {
  constructor() {
    this.validIssueTypes = [
      "Payment Issue",
      "Betting Issue",
      "Profile Issue",
      "Account Issue",
      "Others",
    ];
  }

  async createTicket(req, res) {
    try {
      const { issueType, reason } = req.body;
      const userId = req.user.userId; //get user by token
      console.log(req.user);

      if (!issueType || !reason) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // if (!this.validIssueTypes.includes(issueType)) {
      //   return res.status(400).json({ message: "Invalid issue type" });
      // }

      // const queryNo = this.generateQueryNo();
      // const ticketStatus = status || "";

      const Ticket = await TicketRepository.createTicket({
        issueType,
        reason,
        userId,
      });

      res.status(201).json({
        message: "Ticket created successfully",
        statusCode: 201,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }

  async getAllTickets(req, res) {
    try {
      const tickets = await TicketRepository.getAllTickets();

      res.status(200).json({
        statusCode: 200,
        success: true,
        data: ticket,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching tickets", error: error.message });
    }
  }

  async getTicketsById(req, res) {
    try {
      const userId = req.user.userId; //get user by token
      console.log(req.user);

      const ticket = await TicketRepository.getTicketsById(userId);

      if (ticket == "") {
        res.status(200).json({
          statusCode: 200,
          success: false,
          data: [],
        });
      } else {
        res.status(200).json({
          statusCode: 200,
          success: true,
          data: ticket,
        });
      }
    } catch (error) {
      console.error("Error fetching ticket:", error.message);
      res
        .status(500)
        .json({ message: "Error fetching ticket", error: error.message });
    }
  }

  getIssueTypes(req, res) {
    res.json(this.validIssueTypes);
  }
}

export default new TicketController();
