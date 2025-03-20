//src/routes/UserRoutes.mjs
import express from 'express';
import UserController from '../controllers/UserController.mjs';
import UserRegistrationController from '../controllers/UserRegistrationController.mjs';
import Middleware from '../project_setup/Middleware.mjs'
//import { uploadImages } from '../project_setup/Utils.mjs';

const router = express.Router();

// POST /Route to create a new user
router.post('/createUser', UserRegistrationController.createUser);

// POST /Route for user to signIn
router.post('/signIn', UserRegistrationController.signIn);

// POST /Route for user to signOut
router.post('/signOut', Middleware.user, UserRegistrationController.signOut);

// POST /Route for user to apply for forgetPassword
router.post('/forgetPassword', UserRegistrationController.forgetPassword);

// POST /Route for user confirm otp
router.post('/otp', UserRegistrationController.otp);

// POST /Route for user to changePassword
router.post('/changePassword', UserRegistrationController.changePassword);

// GET /Route to get

router.put('/startGame/:userId', UserController.gameStarted);


export default router;