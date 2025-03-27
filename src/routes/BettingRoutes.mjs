//src/routes/BettingRoutes.mjs
import express from 'express';
import BettingController from '../controllers/BettingController.mjs';
import Middleware from '../project_setup/Middleware.mjs'

const router = express.Router();

// POST /Route to create a new Betting
router.post('/createBetting', Middleware.user, BettingController.createBetting);

// GET /Route to get a latest Betting by user id
router.get('/getBettingDetails', BettingController.getDetailsForLatestUserBettingId);

// GET /Route to get a disribution wallet details
router.post('/distributionWalletDetails', BettingController.distributionWalletDetails);

// GET /Route to get all Betting with pagination
router.get('/getAllBetting', BettingController.getAllBetting);

// GET /Route to fetch total sums of amount and winAmount
router.get('/getBettingsStats', BettingController.getBettingsStats);

// GET /Route to get a latest Betting by its betting ID
//router.get('/getDetailsForLatestBettingId', BettingController.getDetailsForLatestBettingId);


// PUT /Route to update a specific Betting by its ID
router.put('/updateBettingById/:id', BettingController.updateBettingById);

// DELETE /Route to delete a specific Betting by its ID
router.delete('/deleteBettingById/:id', BettingController.deleteBettingById);

// get betting winner
router.get('/getBettingStatus', BettingController.getBettingStatus);

//get betting history
router.get('/getBettingHistory', Middleware.user, BettingController.getBettingHistory);

export default router;   
