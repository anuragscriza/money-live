// src/controllers/CommonHandler.mjs
// src/controllers/CommonHandler.mjs
import bcrypt from "bcryptjs";

class CommonHandler {
    //Valid Inputs
    static validStatusForGames = ["Active", "Deactive", "Upcoming"];
    static validStatuses = ["Active", "Deactive"];
    static validBonusTypes = ["New User Bonus", "Festival Bonus"];
    static validUserRoles = ["admin", "user", "affiliate"];
    static validUserStatuses = ["Active", "Deactive", "Blocked"];
    static validRechargeAndWithdrawalStatuses = [
        "Approved",
        "Pending",
        "Rejected",
    ];
    static validCreaditDebit = ["Credit", "Debit"];
    static validStatementCategory = [
        "Recharge",
        "Withdrawal",
        "Betting",
        "Deposit Bonus",
        "Festival Bonus",
        "New User Bonus",
    ];

    //Valid Formats
    static async validateSixDigitIdFormat(id) {
        if (!/^[0-9]{6}$/.test(id)) {
            throw new ValidationError("Invalid 6 digit id format.");
        }
    }

    static async validateObjectIdFormat(id) {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new ValidationError("Invalid Id format.");
        }
    }

    static async validateEmailFormat(email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new ValidationError("Invalid email format.");
        }
    }

    static async validatePasswordFormat(password) {
        if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
                password
            )
        ) {
            throw new ValidationError(
                "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters."
            );
        }
    }

    static async validateNameFormat(userName) {
        if (!/^[a-zA-Z0-9\s@ ]{4,}$/.test(userName)) {
            throw new ValidationError(
                "Invalid userName. Must be at least 4 characters."
            );
        }
    }

    static async validateMobileFormat(mobile) {
        if (!/^\d{10}$/.test(mobile)) {
            throw new ValidationError("Invalid mobile number. Must be 10 digits.");
        }
    }

    static async validateDOBFormat(dob) {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
            throw new ValidationError(
                "Invalid DOB format. Must be in the format DD/MM/YYYY (e.g., 31/01/2000)."
            );
        }
    }

    static async validateRole(role) {
        if (!CommonHandler.validUserRoles.includes(role)) {
            throw new ValidationError(
                `Role must be one of: ${CommonHandler.validUserRoles.join(
                    ", "
                )} without any space.`
            );
        }
    }

    static async validateStatus(status) {
        if (!CommonHandler.validUserStatuses.includes(status)) {
            throw new ValidationError(
                `Status must be one of: ${CommonHandler.validUserStatuses.join(
                    ", "
                )} without any space.`
            );
        }
    }

    static async validateAccountNumberFormat(accountNumber) {
        if (!/^\d+$/.test(accountNumber)) {
            throw new ValidationError("Invalid account number. Must be a number.");
        }
    }

    static async validateIfscCodeFormat(ifscCode) {
        if (!/^[a-zA-Z]{4}0[a-zA-Z0-9]{6}$/.test(ifscCode)) {
            throw new ValidationError(
                "Invalid IFSC code. Must be in the format of 4 letters followed by 0 and 6 alphanumeric characters in capital letters."
            );
        }
    }

    static async validateUpiIdFormat(upiId) {
        if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
            throw new ValidationError("Invalid UPI ID format.");
        }
    }

    static async validateSaveAsFormat(saveAs) {
        if (!/^[a-zA-Z0-9\s]{1,}$/.test(saveAs)) {
            throw new ValidationError(
                "Invalid saveAs. Must be at least 1 characters and only letters numbers and spaces."
            );
        }
    }

    static async validateRechargeAndWithdrawalStatus(status) {
        if (!CommonHandler.validRechargeAndWithdrawalStatuses.includes(status)) {
            throw new ValidationError(
                `Status must be one of: ${CommonHandler.validRechargeAndWithdrawalStatuses.join(
                    ", "
                )} without any space.`
            );
        }
    }

    static async validateTransactionFormat(transactionNo) {
        if (!/^[a-zA-Z0-9]{6,20}$/.test(transactionNo)) {
            throw new ValidationError(
                "Invalid transaction number. Must be between 6 to 20 characters and only alphanumeric."
            );
        }
    }

    static async validateCreditDebit(type) {
        if (!CommonHandler.validCreaditDebit.includes(type)) {
            throw new ValidationError(
                `Type must be one of: ${CommonHandler.validCreaditDebit.join(
                    ", "
                )} without any space.`
            );
        }
    }

    static async validateStatementCategory(category) {
        if (!CommonHandler.validStatementCategory.includes(category)) {
            throw new ValidationError(
                `Category must be one of: ${CommonHandler.validStatementCategory.join(
                    ", "
                )} without any space.`
            );
        }
    }

    //Password Hashing
    static async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    // Catching Errors
    static catchError(error, res) {
        try {
            if (error instanceof ValidationError) {
                res
                    .status(400)
                    .json({ statusCode: 400, success: false, message: error.message });
            } else if (error instanceof MiddlewareError) {
                res
                    .status(403)
                    .json({ statusCode: 403, success: false, message: error.message });
            } else if (error instanceof NotFoundError) {
                res
                    .status(404)
                    .json({ statusCode: 404, success: false, message: error.message });
            } else {
                res.status(500).json({
                    statusCode: 500,
                    success: false,
                    message: "Internal server error.",
                });
            }
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                success: false,
                message: "Something unexpected has happened",
            });
        }
    }
    // static catchError(error, res) {
    //   try {
    //     if (error instanceof ValidationError) {
    //       res
    //         .status(400)
    //         .json({ status: 400, success: false, message: error.message });
    //     } else if (error instanceof MiddlewareError) {
    //       res
    //         .status(403)
    //         .json({ status: 403, success: false, message: error.message });
    //     } else if (error instanceof NotFoundError) {
    //       res
    //         .status(404)
    //         .json({ status: 404, success: false, message: error.message });
    //     } else {
    //       res
    //         .status(500)
    //         .json({
    //           status: 500,
    //           success: false,
    //           message: "Internal server error.",
    //         });
    //     }
    //   } catch (error) {
    //     res
    //       .status(500)
    //       .json({
    //         status: 500,
    //         success: false,
    //         message: "Something unexpected has happened",
    //       });
    //   }
    // }

    //Required Fields Validation
    static async validateRequiredFields(fields) {
        const missingFields = Object.entries(fields)
            .filter(([_, value]) => value === undefined || value === "")
            .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1));
        if (missingFields.length > 0) {
            throw new NotFoundError(
                `Missing required fields: ${missingFields.join(", ")}`
            );
        }
    }

    static async validateBettingRequiredFields(data) {
        console.log("datavalidatio", data);
        if (!data || typeof data !== "object") {
            return { valid: false, error: "Data must be an object." };
        }

        for (const char of data.data) {
            console.log("characterdsfs", char.characterId);
            if (typeof char !== "object") {
                return { valid: false, error: "Each character entry must be an object." };
            }

            if (!char.characterId || typeof char.characterId !== "string") {
                return { valid: false, error: "characterId must be a number." };
            }

            if (!char.betAmount || typeof char.betAmount !== "string") {
                return { valid: false, error: "amount must be a number." };
            }
        }

        return { valid: true };
    }
}

//Assigned Errors
class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; } }
class NotFoundError extends Error { constructor(message) { super(message); this.name = 'NotFoundError'; } }
class MiddlewareError extends Error { constructor(message) { super(message); this.name = 'MiddlewareError'; } }


export { CommonHandler, ValidationError, NotFoundError, MiddlewareError };
