// src/repository/BettingRepository.mjs
import Betting from '../models/BettingModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class BettingRepository {
    static async createBetting(bettingData) { return await Betting.create(bettingData); }

    static async getAllBetting(options, req) { return await paginate(Betting, {}, options.page, options.limit, req); }

    static async getBettingById(id) { return await Betting.findById(id); }

    static async getCountAndBetsByBettingId(gameId, bettingId) {
        const [count, bettings] = await Promise.all([Betting.countDocuments({ gameId, bettingId }), Betting.find({ gameId, bettingId })]);
        return { count, bettings };
    }

    static async getLatestBettingDataOfUser(bettingId) { return await Betting.findOne({ betting_id: bettingId }).exec(); }

    static async getLatestBettingId() { return await Betting.findOne().sort({ createdAt: -1 }).exec(); }

    static async getBetsAfterCreatedAt(createdAt) { return await Betting.find({ createdAt: { $gt: new Date(createdAt) } }); }

    static async getBettingsStats(gameName = null) {
        const regexGameName = gameName ? new RegExp(gameName, 'i') : null;
        const matchTodayStage = { createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }, ...(regexGameName && { gameName: regexGameName }) };
        const matchAllStage = regexGameName ? { gameName: regexGameName } : {};

        const aggregateSum = async (matchStage, field) => {
            const result = await Betting.aggregate([{ $match: matchStage }, { $group: { _id: null, total: { $sum: field } } }]);
            return result.length > 0 ? result[0].total : 0;
        };

        const [todayAmount, totalAmount, todayWinAmount, totalWinAmount] = await Promise.all([aggregateSum(matchTodayStage, '$amount'), aggregateSum(matchAllStage, '$amount'), aggregateSum(matchTodayStage, '$winAmount'), aggregateSum(matchAllStage, '$winAmount')]);
        return { todayAmount, totalAmount, todayWinAmount, totalWinAmount };
    }

    static async getBettingDashboardStats() {
        const aggregateStats = async (matchStage) => {
            const result = await Betting.aggregate([{ $match: { ...matchStage, status: { $in: ['BetApplied', 'BetWon'] } } }, { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalWinAmount: { $sum: '$winAmount' } } }]);
            const { totalAmount = 0, totalWinAmount = 0 } = result[0] || {};
            const profit = totalAmount - totalWinAmount;
            return { totalAmount, totalWinAmount, profit };
        };
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const [todayStats, totalStats] = await Promise.all([aggregateStats({ createdAt: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) } }), aggregateStats({})]);
        const defaultStats = { totalAmount: 0, totalWinAmount: 0, profit: 0 };
        const formatStats = (stats) => ({ totalAmount: stats.totalAmount || defaultStats.totalAmount, totalWinAmount: stats.totalWinAmount || defaultStats.totalWinAmount, profit: stats.profit || defaultStats.profit });
        const data = { todayAmount: formatStats(todayStats).totalAmount, totalAmount: formatStats(totalStats).totalAmount, todayWinAmount: formatStats(todayStats).totalWinAmount, totalWinAmount: formatStats(totalStats).totalWinAmount, todayProfit: formatStats(todayStats).profit, totalProfit: formatStats(totalStats).profit }
        return data;
    }

    static async getGraphStats(startDate, endDate) {
        const matchStage = { createdAt: { $gte: new Date(startDate), $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) } };
        const aggregateStats = (format) => { return Betting.aggregate([{ $match: matchStage }, { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, totalAmount: { $sum: '$amount' }, totalWinAmount: { $sum: '$winAmount' }, totalProfit: { $sum: { $subtract: ['$amount', '$winAmount'] } } } }, { $sort: { _id: 1 } }]); };
        const dailyStats = aggregateStats('%Y-%m-%d');
        const weeklyStats = aggregateStats('%Y-%U');
        const monthlyStats = aggregateStats('%Y-%m');
        const yearlyStats = aggregateStats('%Y');
        return Promise.all([dailyStats, weeklyStats, monthlyStats, yearlyStats]);
    }

    static async updateBettingById(id, bettingData) {
        const betting = await Betting.findById(id);
        Object.assign(betting, bettingData);
        return await betting.save();
    }

    static async deleteBettingById(id) { return await Betting.findByIdAndDelete(id); }

    static async filterBetting(filterParams, options, req) {
        const query = {};
        if (filterParams.gameName) { query.gameName = new RegExp(filterParams.gameName, 'i'); }
        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            const isNumeric = !isNaN(filterParams.search);
            query.$or = [
                ...(isNumeric ? [{ bettingId: Number(filterParams.search) }, { userId: Number(filterParams.search) }] : []),
                { userName: searchRegex },
                { status: searchRegex }
            ];
        }
        if (filterParams.startDate || filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate) query.createdAt.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) { query.createdAt.$lte = new Date(new Date(filterParams.endDate).setHours(23, 59, 59, 999)); }
        }
        return await paginate(Betting, query, options.page, options.limit, req);
    }

    // create winner logic
    static async getBettingData(createdAt) {
        try {
            const bettingData = await Betting.find({ createdAt: new Date(createdAt) });
            return bettingData;
        } catch (error) {
            console.error('Error fetching betting data:', error);
            throw new Error('Failed to fetch betting data.');
        }
    }

    static async updateBettingWinnerStatus(characterData) {
        await Betting.updateOne(
            {
                "betting_id": characterData.betting_id,             // Add betting_id condition
                "character.character_id": characterData.character_id // Match the nested object
            },
            {
                $set: {
                    "character.$.win_amount": characterData.win_amount,   // Update win_amount in matched object
                    "character.$.status": characterData.status,
                    "game_status": "Completed"       // Update game_status
                }
            }
        );

        await Betting.updateOne(
            {
                "betting_id": characterData.betting_id
            },
            {
                $set: {
                    "character.$[elem].status": "Looser" // Mark remaining as 'Loser'
                }
            },
            {
                arrayFilters: [{ "elem.character_id": { $ne: characterData.character_id } }] // Exclude the winner
            }
        );
    }

}

export default BettingRepository;  