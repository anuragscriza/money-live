// src/controllers/BettingController.mjs
import AmountSetupRepository from '../repositories/AmountSetupRepository.mjs';
import AvailableGamesRepository from '../repositories/AvailableGamesRepository.mjs';
import BettingRepository from '../repositories/BettingRepository.mjs';
import UserRepository from '../repositories/UserRepository.mjs'
import CharacterRepository from '../repositories/CharactersRepository.mjs'
import StatementRepository from '../repositories/StatementRepository.mjs';
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs';
import path from "path";
import fs from "fs";

// // Fix `__dirname` since it's not available in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

class BettingController {
    static async createBetting(req, res) {
        //const userId = req.user.userId;
        try {
            console.log("test");
            // const bettingData = await BettingController.bettingValidation(req.body);
            const betting = await BettingRepository.createBetting({ ...req.body, userId: req.user.userId });
            res.status(201).json({ status: 201, success: true, message: 'Betting created successfully', betting });
        } catch (error) {
            console.log("error - ", error);
            CommonHandler.catchError(error, res);
        }
    }

    // static async getDetailsForLatestUserBettingId(req, res) {
    //     try {
    //         const { bettingId } = req.query;
    //         //const characterData = {};
    //         if (!bettingId) throw new NotFoundError('Please provide bettingId');
    //         if (!/^[0-9]{6}$/.test(bettingId)) { throw new ValidationError('Invalid betting id format.'); }
    //         const latestBet = await BettingRepository.getLatestBettingDataOfUser(bettingId);
    //         console.log("latestBet -", latestBet);

    //         const characterData = await Promise.all(
    //             latestBet.character.map(async (bet) => {
    //                 const characterInfo = await CharacterRepository.getUploadCharactersByCharacterId([bet.character_id]);
    //                 if (characterInfo && Array.isArray(characterInfo) && characterInfo.length > 0) {
    //                     return {
    //                         "character": {
    //                             character_id: bet.character_id,
    //                             character_name: characterInfo[0].character_name,
    //                             bet_amount: bet.amount
    //                         },
    //                         "game_status": latestBet.game_status

    //                     };
    //                 }
    //             })
    //         );

    //         res.status(200).json({
    //             status: 200,
    //             success: true,
    //             message: 'Latest BettingId details fetched successfully',

    //             characterData
    //         });
    //     } catch (error) {
    //         console.log("error - ", error);
    //         CommonHandler.catchError(error, res);
    //     }
    // }

    static async getDetailsForLatestUserBettingId(req, res) {
        try {
            const { bettingId } = req.query;
            if (!bettingId) throw new NotFoundError('Please provide bettingId');
            if (!/^[0-9]{6}$/.test(bettingId)) throw new ValidationError('Invalid betting id format.');

            const latestBet = await BettingRepository.getLatestBettingDataOfUser(bettingId);
            console.log("latestBet -", latestBet);

            if (!latestBet || !latestBet.character || latestBet.character.length === 0) {
                return res.status(404).json({ status: 404, success: false, message: 'No betting data found' });
            }

            const characterData = await Promise.all(
                latestBet.character.map(async (bet) => {
                    const characterInfo = await CharacterRepository.getUploadCharactersByCharacterId(bet.character_id);
                    return {
                        character_id: bet.character_id,
                        character_image: characterInfo.image,
                        character_name: characterInfo.name || "Unknown",
                        bet_amount: bet.amount || 0
                    };


                })
            );
            console.log("characterData - ", characterData);
            const filteredCharacterData = characterData.filter(Boolean);

            res.status(200).json({
                status: 200,
                success: true,
                message: 'Latest BettingId details fetched successfully',
                characterData: filteredCharacterData,
                betting_id: latestBet.betting_id,
                createdAt: latestBet.createdAt,
                game_status: "pending"
            });
        } catch (error) {
            console.log("error - ", error);
            CommonHandler.catchError(error, res);
        }
    }


    static startTime = 0;
    static async distributionWalletDetails(req, res) {
        try {
            if (req.body.reset === true) {
                const reset = await BettingRepository.getLatestBettingId();
                BettingController.startTime = reset.createdAt;
            }
            const bettings = await BettingRepository.getBetsAfterCreatedAt(BettingController.startTime);
            const totalAmount = bettings.reduce((total, bet) => total + bet.amount, 0);
            const totalWinAmount = bettings.reduce((total, bet) => total + bet.winAmount, 0);
            const profit = totalAmount - totalWinAmount;
            res.status(200).json({ status: 200, success: true, message: 'Distribution wallet details fetched successfully', data: profit });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllBetting(req, res) {
        try {
            const { gameName, search, startDate, endDate, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { gameName, search, startDate, endDate };
            const betting = Object.keys(filterParams).length > 0 ?
                await BettingRepository.filterBetting(filterParams, options, req) :
                await BettingRepository.getAllBetting(options, req);
            return res.status(200).json({ status: 200, success: true, message: 'Betting data fetched successfully', ...betting });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getBettingsStats(req, res) {
        try {
            const { gameName } = req.query;
            const data = await BettingRepository.getBettingsStats(gameName);
            res.status(200).json({ status: 200, success: true, message: 'Total stats fetched successfully', data });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getDetailsForLatestBettingId(req, res) {
        try {
            const { gameId, bettingId } = req.query;
            if (!gameId || !bettingId) throw new NotFoundError('Provide both gameId and bettingId');
            if (!/^[0-9]{6}$/.test(bettingId)) { throw new ValidationError('Invalid bettingId format.'); }
            const { count, bettings } = await BettingRepository.getCountAndBetsByBettingId(gameId, bettingId);
            const totalAmount = bettings.reduce((total, bet) => total + bet.amount, 0);
            const data = { gameId, bettingId, count, totalAmount };
            res.status(200).json({ status: 200, success: true, message: 'Latest BettingId details fetched successfully', data });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateBettingById(req, res) {
        try {
            const { id } = req.params;
            await BettingController.validateAndFetchBettingById(id);
            const bettingData = await BettingController.bettingValidation(req.body);
            const betting = await BettingRepository.updateBettingById(id, bettingData);
            res.status(200).json({ status: 200, success: true, message: 'Betting updated successfully', betting });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteBettingById(req, res) {
        try {
            const { id } = req.params;
            await BettingController.validateAndFetchBettingById(id);
            const betting = await BettingRepository.deleteBettingById(id);
            res.status(200).json({ status: 200, success: true, message: 'Betting deleted successfully', betting });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchBettingById(id) {
        await CommonHandler.validateObjectIdFormat(id);
        const betting = await BettingRepository.getBettingById(id);
        if (!betting) { throw new NotFoundError('Betting ID not found.'); }
        return betting;
    }

    static async bettingValidation(data) {
        // const { gameId, bettingId, userId, amount, winAmount, status } = data;
        const { character, userId } = data;
        await CommonHandler.validateBettingRequiredFields({ character });
        //await BettingController.validateFieldTypes({ gameId, bettingId, userId, amount, winAmount, status });

        const [minAmount, maxAmount] = await BettingController.getBettingLimits();
        console.log("minAmount - ", minAmount);
        console.log("maxAmount - ", maxAmount);
        // await BettingController.validateBettingAmount(amount, minAmount, maxAmount);
        await BettingController.validateBettingAmount(character, minAmount, maxAmount);

        const user = await UserRepository.getUserByUserId(userId);
        if (!user) { throw new NotFoundError(`User with userId: ${userId} not found`); }
        data.userName = user.userName;

        // const referenceUser = await UserRepository.getUserByPromoCode(user.referenceCode);

        // const gameDetails = await AvailableGamesRepository.getAvailableGamesByGameId(gameId)

        // if (!gameDetails) { throw new NotFoundError(`Game with this gameId: ${gameId} not found`); }
        // data.gameName = gameDetails.name;
        // console.log(data);

        // if (!user.playedGame.includes(gameDetails.name)) { user.playedGame.push(gameDetails.name); }
        // await BettingController.processBettingStatus(user, amount, winAmount, status, data);


        await user.save();

        return data;
    }

    static async processBettingStatus(user, referenceUser, amount, winAmount, status, data) {
        switch (status) {
            case 'BetApplied':
                await BettingController.deductUserAmount(user, amount);
                await BettingController.updateReferenceUser(referenceUser, amount, 'add');
                user.playedAmount += amount;
                user.lifetimeLoss += amount;

                const createBetAppliedStatement = { userId: user.userId, message: `Hi,${user.userName} you have placed a bet in ${data.gameName} with bettingId: ${data.bettingId}`, amount: amount, category: 'Game', type: 'Debit', status: status };
                await StatementRepository.createStatement(createBetAppliedStatement);

                break;
            case 'BetCancelled':
                user.depositAmount += amount;
                user.playedAmount -= amount;
                user.lifetimeLoss -= amount
                await BettingController.updateReferenceUser(referenceUser, amount, 'subtract');
                data.amount = 0;

                const createBetCancelledStatement = { userId: user.userId, message: `Hi,${user.userName} you have cancelled a bet in ${data.gameName} with bettingId: ${data.bettingId}`, amount: amount, category: 'Game', type: 'Credit', status: status };
                await StatementRepository.createStatement(createBetCancelledStatement);
                break;
            case 'BetWon':
                user.winningsAmount += winAmount;
                user.lifetimeProfit += winAmount;
                await BettingController.updateReferenceUser(referenceUser, amount, 'subtract');

                const createBetWonStatement = { userId: user.userId, message: `Hi,${user.userName} you have won a bet while playing ${data.gameName} with bettingId: ${data.bettingId}`, amount: winAmount, category: 'Game', type: 'Credit', status: status };
                await StatementRepository.createStatement(createBetWonStatement);

                break;
            default:
                throw new ValidationError('Bet Status must be one of: BetApplied, BetCancelled, BetWon');
        }
    }

    static async updateReferenceUser(referenceUser, amount, operation) {
        if (referenceUser) {
            const updateCommission = (referenceUser.commissionPercentage * amount) / 100;
            referenceUser.commissionAmount += (operation === 'add' ? updateCommission : -updateCommission);
            await referenceUser.save();
        }
    }

    static async deductUserAmount(user, amount) {
        const deductionDetails = ['depositAmount', 'winningsAmount', 'bonusAmount', 'commissionAmount', 'referralAmount'];
        let remainingAmount = amount;
        const totalAvailable = deductionDetails.reduce((sum, source) => sum + user[source], 0);

        for (const source of deductionDetails) {
            if (user[source] >= remainingAmount) {
                user[source] -= remainingAmount;
                return;
            } else {
                remainingAmount -= user[source];
                user[source] = 0;
            }
        }
        if (remainingAmount > 0) { throw new ValidationError(`User with userId ${user.userId} does not have the available amount: ${totalAvailable} (required: ${amount}).`); }
    }

    static async validateFieldTypes({ gameId, bettingId, userId, amount, winAmount, status }) {
        if (!/^\d{6}$/.test(gameId)) { throw new ValidationError('GameId must be a number of 6 digits'); }
        if (!/^\d{6}$/.test(bettingId)) { throw new ValidationError('BettingId must be a number of 6 digits'); }
        if (!/^\d{6}$/.test(userId)) { throw new ValidationError('UserId must be a number of 6 digits'); }
        if (typeof amount !== 'number') { throw new ValidationError('Amount must be a number'); }
        if (typeof winAmount !== 'number') { throw new ValidationError('WinAmount must be a number'); }
        if (typeof status !== 'string') { throw new ValidationError('Status must be a string'); }
    }

    static async getBettingLimits() {
        const [minAmountSetting, maxAmountSetting] = await Promise.all([
            AmountSetupRepository.getAmountSetupBySettingName('Minimum Bet Amount'),
            AmountSetupRepository.getAmountSetupBySettingName('Maximum Bet Amount')
        ]);
        if (!minAmountSetting || !maxAmountSetting) throw new NotFoundError('One or both of the amount settings not found for Minimum Bet Amount or Maximum Bet Amount ');
        return [parseInt(minAmountSetting.value), parseInt(maxAmountSetting.value)];
    }

    static async validateBettingAmount(characters, minAmount, maxAmount) {
        for (const character of characters) {
            if (character.amount <= minAmount) throw new ValidationError(`Betting amount must be greater than Minimum Bet Amount: ${minAmount}`);
            if (character.amount >= maxAmount) throw new ValidationError(`Betting amount must be less than Maximum Bet Amount: ${maxAmount}`);
        }
    }

    static async getBettingStatus(req, res) {
        let winner = null;
        let minBetAmount = Infinity;
        const { createdAt } = req.query;
        //if (!bettingId) throw new NotFoundError('Please Provide Betting Id');
        //if (!/^[0-9]{6}$/.test(bettingId)) { throw new ValidationError('Invalid bettingId format.'); }
        const bets = await BettingRepository.getBettingData(createdAt);
        // console.log("bettingResult -- ", bettingResult);
        if (bets && bets.length > 0) {
            // bettingResult.forEach((bet) => {

            //     console.log("bet data --", bet);
            //     // If you need to access individual character objects
            //     // bet.character.forEach((char, index) => {
            //     //     console.log(`Character ${index + 1}:`, char);
            //     // });
            // });
            // Loop through all bets and their characters
            for (const bet of bets) {
                for (const character of bet.character) {
                    if (character.amount < minBetAmount) {
                        minBetAmount = character.amount;
                        winner = {
                            userId: bet.userId,
                            character_id: character.character_id,
                            amount: character.amount,
                            betting_id: bet.betting_id
                        };
                    }
                }
            }

            // Update winning data
            for (const bet of bets) {
                for (const character of bet.character) {
                    if (character.character_id === winner.character_id && character.amount === minBetAmount) {
                        console.log("character --", character);
                        character.win_amount = character.amount * 2;
                        character.status = 'Winner';
                        character.character_id = winner.character_id;
                        character.betting_id = winner.betting_id;
                        await BettingRepository.updateBettingWinnerStatus(character);
                        // await BettingRepository.updateBettingLooserStatus(character);
                    } else {
                        character.status = 'Lost';
                    }
                }
            }

            console.log('Winner:', winner);
            //return bets; // Return updated data with win/loss status
        } else {
            console.log('No data found.');
        }
    }

    // static async getBettingHistory(req, res) {
    //     try {
    //         const userId = req.user.userId;
    //         const bettingData = await BettingRepository.bettingHistory(userId);
    //         const charactersList = await CharacterRepository.getAllUploadCharacters();

    //         // Handle case where bettingData is empty
    //         if (!bettingData || bettingData.length === 0) {
    //             return res.status(200).json({
    //                 status: 200,
    //                 success: true,
    //                 message: "No betting history found",
    //                 bettingHistory: []
    //             });
    //         }

    //         // Create a lookup map for characters (convert keys to String for matching)
    //         const characterMap = {};
    //         for (const character of charactersList) {
    //             characterMap[String(character.characterId)] = character; // Ensure string keys
    //         }

    //         // Attach character details to each bet
    //         const bettingHistoryWithCharacters = bettingData.map(bet => {
    //             const betData = bet._doc || bet; // Handle Mongoose objects
    //             console.log(`Processing Bet ID: ${betData._id}, Character ID: ${betData.characterId}`);

    //             return {
    //                 ...betData,
    //                 characterDetails: characterMap[String(betData.characterId)] || null // Ensure type match
    //             };
    //         });

    //         // Send response
    //         res.status(200).json({
    //             status: 200,
    //             success: true,
    //             message: "Betting history fetched successfully",
    //             bettingHistory: bettingHistoryWithCharacters
    //         });

    //     } catch (error) {
    //         console.error("Error fetching betting history:", error);
    //         CommonHandler.catchError(error, res);
    //     }
    // }

    static async getBettingHistory(req, res) {
        try {
            const userId = req.user.userId;
            const bettingData = await BettingRepository.bettingHistory(userId);
            const charactersList = await CharacterRepository.getAllUploadCharacters();

            // Handle case where bettingData is empty
            if (!bettingData || bettingData.length === 0) {
                return res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: "No betting history found",
                    bettingHistory: []
                });
            }

            // Define image folder path
            const folderPath = 'uploads/characters';

            // Create a lookup map for characters (convert keys to String for matching)
            const characterMap = {};
            for (const character of charactersList) {
                const filename = `${character.name}`;
                const imagePath = path.join(folderPath, `${character.name}.png`);
                characterMap[String(character.characterId)] = {
                    filename,
                    imagePath
                };
            }

            // Attach character image path to each bet
            const bettingHistoryWithCharacters = bettingData.map(bet => {
                const betData = bet._doc || bet; // Handle Mongoose objects
                console.log(`Processing Bet ID: ${betData._id}, Character ID: ${betData.characterId}`);

                return {
                    ...betData,
                    characterDetails: characterMap[String(betData.characterId)] || { filename: null, folderPath: null } // Only pass filename & folderPath
                };
            });

            // Send response
            res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Betting history fetched successfully",
                bettingHistory: bettingHistoryWithCharacters
            });

        } catch (error) {
            console.error("Error fetching betting history:", error);
            CommonHandler.catchError(error, res);
        }
    }

    static async getBettingHistoryUsingGameId(req, res) {
        try {
            ///console.log();
            //console.log("query --", req.query.gameId);
            const userId = req.user.userId;
            const bettingData = await BettingRepository.bettingHistoryByGameIdAndUserId(userId, req.query.gameId);
            const charactersList = await CharacterRepository.getAllUploadCharacters();

            // Handle case where bettingData is empty
            if (!bettingData || bettingData.length === 0) {
                return res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: "No betting history found",
                    bettingHistory: []
                });
            }
            // Define image folder path
            const folderPath = 'uploads/characters';

            // Create a lookup map for characters (convert keys to String for matching)
            const characterMap = {};
            for (const character of charactersList) {
                const filename = `${character.name}`;
                const imagePath = path.join(folderPath, `${character.name}.png`);
                characterMap[String(character.characterId)] = {
                    filename,
                    imagePath
                };
            }

            // Attach character image path to each bet
            const bettingHistoryWithCharacters = bettingData.map(bet => {
                const betData = bet._doc || bet; // Handle Mongoose objects

                return {
                    ...betData,
                    characterDetails: characterMap[String(betData.characterId)] || { filename: null, folderPath: null },
                    createdAt: new Date(bet.createdAt).toLocaleString("en-GB", {
                        timeZone: "Asia/Kolkata", // Ensure time is in IST
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true // Ensures AM/PM format
                    }).replace(",", "")

                };
            });

            // Send response
            res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Betting history fetched successfully",
                bettingHistory: bettingHistoryWithCharacters
            });

        } catch (error) {
            console.error("Error fetching betting history:", error);
            CommonHandler.catchError(error, res);
        }
    }

    static async getBettingHiostoryData(req, res) {
        try {
            const userId = req.user.userId;
            const bettingData = await BettingRepository.bettingHistoryByGameIdAndUserId(userId, req.body.gameId);
            const charactersList = await CharacterRepository.getAllUploadCharacters();

            // Handle case where bettingData is empty
            if (!bettingData || bettingData.length === 0) {
                return res.status(200).json({
                    statusCode: 200,
                    success: true,
                    message: "No betting history found",
                    bettingHistory: []
                });
            }
            // Define image folder path
            const folderPath = 'uploads/characters';

            // Create a lookup map for characters (convert keys to String for matching)
            const characterMap = {};
            for (const character of charactersList) {
                const filename = `${character.name}`;
                const imagePath = path.join(folderPath, filename);
                characterMap[String(character.characterId)] = {
                    filename,
                    imagePath
                };
            }

            // Attach character image path to each bet
            const bettingHistoryWithCharacters = bettingData.map(bet => {
                const betData = bet._doc || bet; // Handle Mongoose objects
                console.log(`Processing Bet ID: ${betData._id}, Character ID: ${betData.characterId}`);

                return {
                    ...betData,
                    characterDetails: characterMap[String(betData.characterId)] || { filename: null, folderPath: null } // Only pass filename & folderPath
                };
            });

            // Send response
            res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Betting history fetched successfully",
                bettingHistory: bettingHistoryWithCharacters
            });

        } catch (error) {
            console.error("Error fetching betting history:", error);
            CommonHandler.catchError(error, res);
        }
    }
}

export default BettingController;