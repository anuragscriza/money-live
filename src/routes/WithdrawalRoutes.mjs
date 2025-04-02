// src/routes/WithdrawalRoutes.mjs
import express from 'express';
import Middleware from '../project_setup/Middleware.mjs'
import WithdrawalController from '../controllers/WithdrawalController.mjs';

const router = express.Router();

// POST /Route to create a new withdrawal request by userId and saveAs
router.post('/createWithdrawal', Middleware.user, WithdrawalController.createWithdrawal);

// GET /Route to get all the withdrawals
router.get('/getAllWithdrawalsWithStatus', Middleware.user, WithdrawalController.getAllWithdrawalsWithStatus);


export default router;
