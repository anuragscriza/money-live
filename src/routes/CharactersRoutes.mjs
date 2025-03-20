// src/routes/AvailableGamesRoutes.mjs
import express from 'express';
import CharactersController from '../controllers/CharactersController.mjs';

const router = express.Router();


// GET /Route to get all Available Games
router.get('/getAllCharacters', CharactersController.getAllUploadCharacters);

// GET /Route to get a specific Available Game by its ID
router.get('/getUploadCharactersByCharacterId/:characterId', CharactersController.getUploadCharactersByCharacterId);

// GET /Route to fetch all game names
router.get('/getAllCharactersName', CharactersController.getAllCharactersName);

export default router;