// src/controllers/UploadCharactersController.mjs
import UploadCharactersRepository from "../repositories/CharactersRepository.mjs";
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix `__dirname` since it's not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class CharactersController {
    static async createUploadCharacters(req, res) {
        try {
            const uploadCharactersData = await UploadCharactersController.uploadCharactersValidation(req.body);

            const uploadCharacters = await UploadCharactersRepository.createUploadCharacters(uploadCharactersData);
            res.status(201).json({ status: 201, success: true, message: 'Upload characters created successfully', data: uploadCharacters });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    // static async getAllUploadCharacters(req, res) {
    //     try {
    //         const charactersList = await UploadCharactersRepository.getAllUploadCharacters();
    //         // const uploadCharacters = await UploadCharactersRepository.filterUploadCharacters(filterParams);
    //         res.status(200).json({ status: 200, success: true, message: 'characters fetched successfully', charactersList });
    //     } catch (error) {
    //         CommonHandler.catchError(error, res);
    //     }
    // }

    static async getAllUploadCharacters(req, res) {
        try {
            const charactersList = await UploadCharactersRepository.getAllUploadCharacters();

            // Define folder for saving images
            const folderPath = path.join(__dirname, '../../uploads/characters');

            // Ensure the folder exists
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            // Process each character
            for (let i = 0; i < charactersList.length; i++) {
                let character = charactersList[i];

                if (character.image) {
                    // Check if the image is Base64 and clean it
                    const base64Data = character.image.replace(/^data:image\/\w+;base64,/, "");
                    const imageBuffer = Buffer.from(base64Data, 'base64');

                    // Generate a unique filename
                    const filename = `${character.name}.png`;
                    const outputPath = path.join(folderPath, filename);

                    // Save the image file
                    await fs.promises.writeFile(outputPath, imageBuffer);

                    // Update the character object with the new image path
                    character.image = `/uploads/characters/${filename}`;
                }
            }

            // Send response with updated image paths
            res.status(200).json({
                status: 200,
                success: true,
                message: 'Characters fetched and images processed successfully',
                charactersList
            });

        } catch (error) {
            console.error("Error processing characters:", error);
            CommonHandler.catchError(error, res);
        }
    }

    static async getUploadCharactersByCharacterId(req, res) {
        try {
            const { characterId } = req.params;
            const uploadCharacters = await UploadCharactersController.validateAndFetchUploadCharactersByCharacterId(characterId);
            res.status(200).json({ status: 200, success: true, message: 'Upload character fetched successfully', data: uploadCharacters });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllCharactersName(req, res) {
        try {
            const charactersName = await UploadCharactersRepository.getAllCharactersName(req);
            const data = charactersName.data.map(character => ({ name: character.name }));
            res.status(200).json({ status: 200, success: true, message: 'Upload characters names fetched successfully', data });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateUploadCharactersByCharacterId(req, res) {
        try {
            const { characterId } = req.params;
            console.log(characterId);

            await UploadCharactersController.validateAndFetchUploadCharactersByCharacterId(characterId);
            const uploadCharactersData = await UploadCharactersController.uploadCharactersValidation(req.body, true);
            const updatedUploadCharacters = await UploadCharactersRepository.updateUploadCharactersByCharacterId(characterId, uploadCharactersData);
            res.status(200).json({ status: 200, success: true, message: 'Upload characters updated successfully', data: updatedUploadCharacters });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteUploadCharactersByCharacterId(req, res) {
        try {
            const { characterId } = req.params;
            const uploadCharacters = await UploadCharactersController.validateAndFetchUploadCharactersByCharacterId(characterId);
            const deletedUploadCharacters = await UploadCharactersRepository.deleteUploadCharactersByCharacterId(characterId, uploadCharacters);
            res.status(200).json({ status: 200, success: true, message: 'Upload characters deleted successfully', data: deletedUploadCharacters });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchUploadCharactersByCharacterId(characterId) {
        await CommonHandler.validateSixDigitIdFormat(characterId);
        const uploadCharacters = await UploadCharactersRepository.getUploadCharactersByCharacterId(characterId);
        if (!uploadCharacters) { throw new NotFoundError('Upload characters not found.'); }
        return uploadCharacters;
    }

    static async uploadCharactersValidation(data, isUpdate = false) {
        const { name, image, status } = data;

        await CommonHandler.validateRequiredFields({ name, image });
        if (typeof name !== 'string') { throw new ValidationError('Name must be a string'); }
        if (!isUpdate && await UploadCharactersRepository.checkDuplicateCharactersName(name)) { throw new ValidationError('A game with the same name already exists.'); }
        if (isUpdate && !CommonHandler.validStatusForGames.includes(status)) { throw new ValidationError(`Status must be one of: ${CommonHandler.validStatusForGames.join(', ')} without any space`); }
        if (!image) { throw new ValidationError('Upload character image is required'); }

        Object.assign(data, {
            name: name.trim(),
            image: image.trim()
        });

        return data;
    }
}

export default CharactersController;