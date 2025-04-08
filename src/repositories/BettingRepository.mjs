// src/repository/BettingRepository.mjs
import Betting from "../models/BettingModel.mjs";
import { paginate } from "../project_setup/Utils.mjs";

class BettingRepository {
    static async createBetting(bettingData) {
        const bettingId = Math.floor(100000 + Math.random() * 900000);
        const betsArray = Object.keys(bettingData)
            .filter(key => !isNaN(key)) // Select only numeric keys (0,1,...)
            .map(key => ({
                characterId: bettingData[key].characterId,
                betAmount: bettingData[key].betAmount,
                userName: bettingData[key].userName,
                userId: bettingData[key].userId,
                bettingId: bettingId
            }));
        return await Betting.insertMany(betsArray);
    }

    // static async getAllBetting(options, req) {
    //     return await paginate(Betting, {}, options.page, options.limit, req);
    // }

    static async getBettingById(id) {
        return await Betting.findById(id);
    }

    static async getCountAndBetsByBettingId(gameId, bettingId) {
        const [count, bettings] = await Promise.all([
            Betting.countDocuments({ gameId, bettingId }),
            Betting.find({ gameId, bettingId }),
        ]);
        return { count, bettings };
    }

    static async getLatestBettingDataOfUser(bettingId) {
        return await Betting.find({ bettingId: bettingId }).exec();
    }

    static async getLatestBettingId() {
        return await Betting.findOne().sort({ createdAt: -1 }).exec();
    }

    static async getBetsAfterCreatedAt(createdAt) {
        return await Betting.find({ createdAt: { $gt: new Date(createdAt) } });
    }

    static async updateBettingById(id, bettingData) {
        const betting = await Betting.findById(id);
        Object.assign(betting, bettingData);
        return await betting.save();
    }

    static async deleteBettingById(id) {
        return await Betting.findByIdAndDelete(id);
    }

    static async filterBetting(filterParams, options, req) {
        const query = {};
        if (filterParams.gameName) {
            query.gameName = new RegExp(filterParams.gameName, "i");
        }
        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, "i");
            const isNumeric = !isNaN(filterParams.search);
            query.$or = [
                ...(isNumeric
                    ? [
                        { bettingId: Number(filterParams.search) },
                        { userId: Number(filterParams.search) },
                    ]
                    : []),
                { userName: searchRegex },
                { status: searchRegex },
            ];
        }
        if (filterParams.startDate || filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate)
                query.createdAt.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) {
                query.createdAt.$lte = new Date(
                    new Date(filterParams.endDate).setHours(23, 59, 59, 999)
                );
            }
        }
        return await paginate(Betting, query, options.page, options.limit, req);
    }

    // create winner logic
    // static async getBettingData(bettingId) {
    //     try {
    //         const bettingData = await Betting.find({
    //             createdAt: new Date(createdAt),
    //         });
    //         return bettingData;
    //     } catch (error) {
    //         console.error("Error fetching betting data:", error);
    //         throw new Error("Failed to fetch betting data.");
    //     }
    // }

    static async getBettingData(bettingId, userId) {
        try {
            const betting = await Betting.findOne({ "bettingId": bettingId });
            console.log("betting", betting);
            if (!betting) {
                throw new Error("Betting record not found.");
            }

            const toTime = betting.createdAt;
            const fromTime = new Date(toTime.getTime() - 60 * 1000);
            const bettingData = await Betting.find({
                //user: userId,
                createdAt: {
                    $gte: fromTime.toISOString(),
                    $lte: toTime.toISOString(),
                },
            });
            return bettingData;
        } catch (error) {
            console.error("Error fetching betting data:", error);
            throw new Error("Failed to fetch betting data.");
        }
    }


    static async updateBettingWinnerStatus(characterData) {
        await Betting.updateOne(
            {
                bettingId: characterData.bettingId, // Add betting_id condition
                characterId: characterData.characterId, // Match the nested object
            },
            {
                $set: {
                    winAmount: characterData.winAmount, // Update win_amount in matched object
                    characterStatus: characterData.characterStatus,
                    gameStatus: "Completed", // Update game_status
                },
            }
        );
    }

    static async bettingHistory(userId) {
        return await Betting.find({
            userId: userId,
            gameStatus: "Complete",
            characterStatus: "Winner",
        })
            .sort({ createdAt: -1 })
            .select(
                "userId gameId userName characterId betAmount winAmount bettingId"
            );
    }

    static async bettingHistoryByGameIdAndUserId(userId, gameId) {
        return await Betting.find({
            userId: userId,
            gameId: gameId,
            gameStatus: "Complete",
        })
            .sort({ createdAt: -1 })
            .select(
                "userId gameId userName characterId betAmount winAmount bettingId characterStatus createdAt"
            );
    }
    // Existing methods...

    static async getBettingSumByUserId(userId) {
        const result = await Betting.aggregate([
            { $match: { userId: userId, gameStatus: "Complete" } },
            { $group: { _id: null, totalBetAmount: { $sum: "$betAmount" } } }
        ]);
        return result.length > 0
            ? { totalBetAmount: result[0].totalBetAmount, }
            : { totalAmount: 0 };
    }

    static async isGameIdExists(gameId) {
        const existing = await Betting.findOne({ where: { gameId } });
        return !!existing;
    }

    static async updateLooserGameStatusAndGameId(gameId) {
        await Betting.updateOne(
            {
                bettingId: bettingId
            },
            {
                $set: {
                    "characters.$[elem].gameId": gameId
                }
            },
            {
                arrayFilters: [
                    { "elem.characterStatus": "Looser" }
                ]
            }
        );
    }


}

export default BettingRepository;
