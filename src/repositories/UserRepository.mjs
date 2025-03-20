// src/repositories/UserRepository.mjs
import fs from 'fs';
import path from 'path';
import User from '../models/UserModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class UserRepository {
    static async createUser(userData) { return await User.create(userData); }

    static async getAllUsers(options, req) { return await paginate(User, {}, options.page, options.limit, req); }

    static async getUserByEmail(email) { return await User.findOne({ email: new RegExp(`^${email}`, 'i') }); }

    static async getUserByMobile(mobile) { return await User.findOne({ mobile }); }

    static async getUserByPromoCode(promoCode) { return await User.findOne({ promoCode }); }

    static async getAllSubRegisteredUsersByPromoCode(referenceCode) { return await User.find({ referenceCode }); }

    static async getUserByReferenceCode(promoCode) { return await User.findOne({ promoCode }); }

    static async getUserByUserId(userId) { return await User.findOne({ userId }); }

    static async getRefferringUsers(options, req) { return paginate(User, { numberOfReferrals: { $gte: 1 }, role: { $ne: 'admin' } }, options.page, options.limit, req, { numberOfReferrals: -1 }); }

    static async getAllUsersDataInCSV() {
        const users = await User.find({}).lean();
        return users.map(user => {
            const userObj = new User(user).toObject({ virtuals: true });
            return { ...userObj, _id: userObj._id.toString(), playedGame: userObj.playedGame.join(', '), accessiableGames: userObj.accessiableGames.join(', ') };
        });
    }

    static async getAllAffiliateUsers(role, options, req) {
        const query = { role };
        return await paginate(User, query, options.page, options.limit, req);
    }

    static async getUserDashboardStats() {
        const today = new Date().setHours(0, 0, 0, 0);
        const [usersCreatedToday, totalUsers, todayAffiliates, totalAffiliates] = await Promise.all([User.countDocuments({ createdAt: { $gte: today } }), User.countDocuments({}), User.countDocuments({ role: 'affiliate', createdAt: { $gte: today } }), User.countDocuments({ role: 'affiliate' })]);
        const data = { usersCreatedToday, totalUsers, todayAffiliates, totalAffiliates };
        return data;
    }

    static async updateUserByUserId(userId, userData) { return await User.findOneAndUpdate({ userId }, userData, { new: true }); }

    static async updateUserImageByUserId(userId, newImagePath) {
        const user = await User.findOne({ userId });
        const imagePath = path.join('src/public/profileImages', path.basename(user.image));
        await fs.promises.unlink(imagePath).catch(err => { if (err.code !== 'ENOENT') throw err; });
        user.image = newImagePath;
        await user.save();
        return user;
    }

    static async deleteUserByUserId(userId) {
        const user = await User.findOneAndDelete({ userId });
        if (user) {
            const imagePath = path.join('src/public/profileImages', path.basename(user.image));
            await fs.promises.unlink(imagePath).catch(err => { if (err.code !== 'ENOENT') throw err; });
        }
        return user;
    }

    static async filterUsers(filterParams, options, req) {
        const query = {};
        if (filterParams.status) { query.status = new RegExp(`^${filterParams.status}`, 'i'); }
        if (filterParams.role) { query.role = new RegExp(`^${filterParams.role}`, 'i'); }
        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$userId" }, regex: searchRegex } } },
                { $expr: { $regexMatch: { input: { $toString: "$mobile" }, regex: searchRegex } } },
                { email: searchRegex }
            ];
        }
        if (filterParams.startDate || filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate) query.createdAt.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) { query.createdAt.$lte = new Date(new Date(filterParams.endDate).setHours(23, 59, 59, 999)); }
        }
        return await paginate(User, query, options.page, options.limit, req);
    }
}

export default UserRepository;