import express from "express";
import BankAccountController from "../controllers/BankAccountController.mjs";
import Middleware from "../project_setup/Middleware.mjs";

const router = express.Router();

router.post("/createBank",Middleware.user, BankAccountController.create);
router.put("/bank/:id",Middleware.user, BankAccountController.update);
// Get all bank accounts
router.get("/getAllAccounts",Middleware.user, BankAccountController.getAllAccount);


export default router;
