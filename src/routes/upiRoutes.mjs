import express from "express";
import UpiAccountController from "../controllers/upiController.mjs";

const router = express.Router();

router.post("/createUpi", UpiAccountController.create);

router.put("/upi/:id", UpiAccountController.update);

//get all account
router.get("/getAllbankAccount", UpiAccountController.getAll);

// Get bank accounts by user ID
router.get("/getbankAccount/:UserId", UpiAccountController.getByUserId);

// Get a single bank account by ID
router.get("/getbankAccount/:id", UpiAccountController.getById);

//delete bank account
router.delete("/deletebankAccount/:id", UpiAccountController.delete);

export default router;
