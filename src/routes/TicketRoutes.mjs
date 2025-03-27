import express from "express";
import Middleware from "../project_setup/Middleware.mjs";
import TicketController from "../controllers/TicketController.mjs";
const router = express.Router();

// Route to create a new ticket
router.post("/createTicket", Middleware.user, TicketController.createTicket);

// Route to getAll ticket
router.get("/getAllTicket", Middleware.user, TicketController.getAllTickets);

//Route to getuserId ticket
router.get("/getTickets", Middleware.user, TicketController.getTicketsById);

// Route to get available issue types
router.get("/issue-types", Middleware.user, TicketController.getIssueTypes);

export default router;

// import express from "express";
// import { createTicket, getAllTickets, getTicketsByUserId, getIssueTypes } from "../controllers/ticketController.js";

// const router = express.Router();

// router.post("/tickets", createTicket);
// router.get("/tickets", getAllTickets);
// router.get("/tickets/:userId", getTicketsByUserId);
// router.get("/issue-types", getIssueTypes);

// export default router;
