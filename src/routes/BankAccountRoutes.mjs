import express from "express";
import BankAccountController from "../controllers/BankAccountController.mjs"; // Ensure correct path
import Middleware from "../project_setup/Middleware.mjs";

const router = express.Router();

// Create a new bank account
router.post("/createBank", Middleware.user, BankAccountController.create);

// // Update bank account (Ensure `update` method exists in BankAccountController)
// router.put("/bank/:id", Middleware.user, BankAccountController.update);

// Get all bank accounts
router.get("/getAllAccounts", Middleware.user, BankAccountController.getAllAccounts);  // Ensure method name matches

// Get all accounts by type (Bank or UPI)
router.get("/getAllAccounts/:type", Middleware.user, BankAccountController.getAllAccounts); // Ensure method name exists

// Define the route to get bank account details by userId
router.get('/bank-account',Middleware.user, BankAccountController.getBankAccountByUserId);

// Delete Bank Account by userId
router.delete('/bank-account/:accountId',Middleware.user, BankAccountController.deleteBankAccountByaccountId);


export default router;
