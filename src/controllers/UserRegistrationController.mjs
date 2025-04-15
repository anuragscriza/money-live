// src/controllers/UserRegistrationController.mjs
import bcrypt from "bcryptjs";
import UserRepository from "../repositories/UserRepository.mjs";
import AmountSetupRepository from "../repositories/AmountSetupRepository.mjs";
import { sendEmail } from "../project_setup/Utils.mjs";
import {
    CommonHandler,
    ValidationError,
    NotFoundError,
} from "./CommonHandler.mjs";
import Middleware from "../project_setup/Middleware.mjs";

class UserRegistrationController {
    static async createUser(req, res) {
        try {
            const userData = await UserRegistrationController.validateUserData(req);
            console.log("userData --", userData);
            const user = await UserRepository.createUser(userData);
            res.status(201).json({
                statusCode: 201,
                success: true,
                message: "User created successfully",
                user,
            });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async signIn(req, res) {
        try {
            const { user, password } = req.body;
            await CommonHandler.validateRequiredFields({ user, password });

            const existingUser = await UserRegistrationController.getUser(
                user.trim()
            );

            // Return the same response for both wrong user and password
            if (
                !existingUser ||
                !(await bcrypt.compare(password, existingUser.password))
            ) {
                return res.status(401).json({
                    statusCode: 401,
                    success: false,
                    message: "Invalid credentials.",
                });
            }

            // Check if the user is active
            if (existingUser.status !== "Active") {
                return res.status(403).json({
                    success: false,
                    message: "User account has been deleted or suspended.",
                });
            }

            // Generate token after successful authentication
            const token = await Middleware.generateToken(
                {
                    userId: existingUser.userId,
                    email: existingUser.email,
                    objectId: existingUser._id,
                    role: existingUser.role,
                    accessiableGames: existingUser.accessiableGames,
                },
                res
            );

            res.status(200).json({
                statusCode: 200,
                success: true,
                message: "sign in successful!",
                user: {
                    userId: existingUser.userId,
                    email: existingUser.email,
                    token,
                },
            });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async signOut(req, res) {
        try {
            res.clearCookie("jwt");
            res.status(200).json({
                status: 200,
                success: true,
                message: "User sign out is successful!",
            });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async forgetPassword(req, res) {
        try {
            const { email } = req.body;
            await CommonHandler.validateRequiredFields({ email });
            await CommonHandler.validateEmailFormat(email.trim());
            const user = await UserRepository.getUserByEmail(email.trim());
            if (!user) throw new NotFoundError("User not found.");
            const otp = Math.floor(100000 + Math.random() * 900000);
            user.otp = otp;
            await user.save();
            await sendEmail(
                email,
                "Password Reset OTP",
                `Your OTP for password reset is: ${otp}`
            );
            res.status(200).json({
                statusCode: 200,
                success: true,
                message: `OTP sent to your email.thi is your otp ${otp}`,
            });
        } catch (error) {
            console.log("error --", error);
            CommonHandler.catchError(error, res);
        }
    }

    static async otp(req, res) {
        try {
            const { email, otp } = req.body;
            await CommonHandler.validateRequiredFields({ email, otp });
            const user = await UserRepository.getUserByEmail(email.trim());
            if (otp !== user.otp) throw new ValidationError("Invalid OTP.");
            user.otp = null;
            await user.save();
            res.status(200).json({
                statusCode: 200,
                success: true,
                message: "OTP verified successfully.",
            });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async changePassword(req, res) {
        try {
            const { email, password } = req.body;
            await CommonHandler.validateRequiredFields({ email, password });
            await CommonHandler.validatePasswordFormat(password);
            const user = await UserRepository.getUserByEmail(email.trim());
            if (!user) throw new NotFoundError("User not found.");
            user.password = await CommonHandler.hashPassword(password);
            await user.save();
            res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Password reset successfully.",
            });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async changeUserImage(req, res) {
        try {
            const { userId } = req.params;
            const newImagePath = `${req.protocol}://${req.get(
                "host"
            )}/profileImages/${req.file.filename}`;
            const updatedUserImage = await UserRepository.updateUserImageByUserId(
                userId,
                newImagePath
            );
            res.status(200).json({
                status: 200,
                success: true,
                message: "Image updated successfully.",
                updatedUserImage,
            });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async getUser(user) {
        if (typeof user !== "string")
            throw new ValidationError(
                "Invalid email, userId, or mobile provided in string format."
            );
        if (user.includes("@")) return UserRepository.getUserByEmail(user);
        if (/^\d{10}$/.test(user))
            return UserRepository.getUserByMobile(parseInt(user, 10));
        if (!isNaN(user)) return UserRepository.getUserByUserId(user);
        throw new ValidationError("Invalid email, userId, or mobile provided.");
    }

    static async validateUserData(data, isUpdate = false) {
        const { fullName, userName, email, mobile, password, dob, gender } =
            data.body;

        if (!isUpdate) {
            await CommonHandler.validateRequiredFields({
                fullName,
                userName,
                email,
                mobile,
                password,
                gender,
                dob,
            });
        }
        if (userName) {
            await CommonHandler.validateNameFormat(userName);
        }
        if (userName) {
            data.body.userName = userName.trim();
        }
        if (email) {
            await CommonHandler.validateEmailFormat(email);
        }
        if (email) {
            data.body.email = email.trim();
        }
        if (mobile) {
            await CommonHandler.validateMobileFormat(mobile);
        }
        if (password) {
            await CommonHandler.validatePasswordFormat(password);
        }
        // if (image) { data.body.image = image };
        if (dob) {
            await CommonHandler.validateDOBFormat(dob);
        }
        if (dob) {
            data.body.dob = dob.trim();
        }
        //if (role) { await CommonHandler.validateRole(role); }
        // if (status) { await CommonHandler.validateStatus(status); }
        // if (status) { data.body.status = status.trim(); }

        if (!isUpdate) {
            await UserRegistrationController.checkExistingUser(
                data.body.email,
                mobile
            );
            data.body.password = await CommonHandler.hashPassword(password);
            data.body.bonusAmount =
                await UserRegistrationController.getInitialBonus();
            // data.body = await UserRegistrationController.handleReferral(data.body, referenceCode);
        }
        return data.body;
    }

    static async checkExistingUser(email, mobile) {
        if (await UserRepository.getUserByEmail(email)) {
            throw new ValidationError("Email already registered.");
        }
        if (await UserRepository.getUserByMobile(mobile)) {
            throw new ValidationError("Mobile number already registered.");
        }
    }

    static async getInitialBonus() {
        const joiningBonus =
            await AmountSetupRepository.getAmountSetupBySettingName("Initial Bonus");
        if (!joiningBonus) {
            throw new NotFoundError(
                'Amount Setting with name "Initial Bonus" not found'
            );
        }
        return parseInt(joiningBonus.value);
    }

    static async handleReferral(data, referenceCode) {
        if (referenceCode) {
            data.referenceCode = referenceCode.toUpperCase();
            const referredByUser = await UserRepository.getUserByPromoCode(
                data.referenceCode
            );
            if (!referredByUser) {
                data = await UserRegistrationController.assignAdminReferral(data);
            } else {
                await UserRegistrationController.updateReferralUser(
                    referredByUser,
                    data
                );
            }
        } else {
            data = await UserRegistrationController.assignAdminReferral(data);
        }
        return data;
    }

    static async assignAdminReferral(data) {
        const admin = await UserRepository.getUserByEmail("admin@scriza.in");
        if (admin) {
            data.referenceCode = admin.promoCode;
            admin.numberOfReferrals += 1;
            await admin.save();
        }
        return data;
    }

    static async updateReferralUser(referredByUser, data) {
        const perReferalBonus =
            await AmountSetupRepository.getAmountSetupBySettingName(
                "Per Referal Bonus"
            );
        if (!perReferalBonus) {
            throw new NotFoundError(
                `Amount Setting with name "Per Referal Bonus" not found`
            );
        }
        const perReferralAmount = parseInt(perReferalBonus.value);
        if (referredByUser.role === "user") {
            await UserRegistrationController.updateUserReferralCommission(
                referredByUser,
                perReferralAmount
            );
        } else if (referredByUser.role === "affiliate") {
            data.accessiableGames = referredByUser.accessiableGames;
        }
        await referredByUser.save();
    }

    static async updateUserReferralCommission(user, perReferralAmount) {
        user.referralAmount += perReferralAmount;
        user.lifetimeReferralAmount += perReferralAmount;
        user.numberOfReferrals += 1;
        const levels = [
            { name: "Level 1 Commission", threshold: 10 },
            { name: "Level 2 Commission", threshold: 5 },
            { name: "Level 3 Commission", threshold: 0 },
        ];
        for (const level of levels) {
            if (user.numberOfReferrals >= level.threshold) {
                const commission =
                    await AmountSetupRepository.getAmountSetupBySettingName(level.name);
                if (!commission) {
                    throw new NotFoundError(
                        `Amount Setting with name "${level.name}" not found`
                    );
                }
                user.commissionPercentage = parseInt(commission.value);
                break;
            }
        }
    }
}

export default UserRegistrationController;