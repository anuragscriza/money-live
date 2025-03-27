// import UpdateUserRepository from "../repositories/UpdateUserRepository.mjs";
import UserRegistrationController from "./UserRegistrationController.mjs";
import { CommonHandler } from "../controllers/CommonHandler.mjs";
import UserRepository from "../repositories/UserRepository.mjs";

class UserController {
    async UserController(req, res) {
        try {
            const updateByUserId = await UserRepository.UserController(
                req.params.id,
                req.body
            );
            res.json(updateByUserId);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateByUserId(req, res) {
        try {
            console.log("Update request received:", req.params.userId, req.body); // Debug log

            const { userId } = req.params;
            const updateData = req.body;

            if (!userId || Object.keys(updateData).length === 0) {
                return res.status(400).json({ message: "Invalid request data" });
            }

            const updatedUser = await UserRepository.updateByUserId(
                userId,
                updateData
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res
                .status(200)
                .json({ message: "User updated successfully", data: updatedUser });
        } catch (error) {
            res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
    }
    // Get user profile using token userId
    static async getUserProfile(req, res) {
        const userId = req.user.userId; //get user by token
        console.log(req.user);

        const userData = await UserRepository.getUserByUserId(userId);
        console.log(userData);
        let userProfile = {
            fullName: userData.fullName,
            email: userData.email,
            mobile: userData.mobile,
            totalWins: 0,
            totalCoin: 0,
            totalDeposit: 0,
            totalWithdrawal: 0,
            image: userData.image,
            address: userData.address,
            country: userData.country,
            totalLoss: 0,
            userName: userData.userName,
            gender: userData.gender,
        };

        if (userId == 520185) {
            userProfile = {
                fullName: userData.fullName,
                email: userData.email,
                mobile: userData.mobile,
                totalWins: 20,
                totalCoin: 50129,
                totalDeposit: 3000,
                totalWithdrawal: 1500,
                image: userData.image,
                address: userData.address,
                country: userData.country,
                totalLoss: 50,
                userName: userData.userName,
                gender: userData.gender,
            };
        }

        res.status(200).json({
            statusCode: 200,
            success: true,
            data: userProfile,
        });
    }
    catch(error) {
        CommonHandler.catchError(error, res);
    }
    static async updateUserByUserId(req, res) {
        try {
            const userId = req.user.userId;
            // await UserController.validateAndFetchUserByUserId(userId);
            // const userData = await UserRegistrationController.validateUserData(req, true)
            const updatedUser = await UserRepository.updateUserByUserId(
                userId,
                req.body
            );
            res.status(200).json({
                status: 200,
                success: true,
                message: `Data updated successfully for userId ${userId}`,
                updatedUser,
            });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }


    static async gameStarted(req, res) {
        try {
            const { userId } = req.params;
            //const gameDateTime = req.body.game_started
            const isoDate = new Date().toISOString();
            const updatedUser = await UserRepository.updateUserByUserId(userId, { "game_started": isoDate });
            res.status(200).json({ status: 200, success: true, message: `Data updated successfully for userId ${userId}`, updatedUser });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }
}

export default UserController;
