import BankAccount from "../models/BankAccountModel.mjs";
import UpiAccount from "../models/upiModel.mjs";

class AccountRepository {
  
  // ✅ Create a new Bank or UPI account
  async create(data, type) {
    if (type === "upi") {
      return await UpiAccount.create(data);
    }
    return await BankAccount.create(data);
  }

  // ✅ Update Bank or UPI account by ID
  async update(id, data, type) {
    if (type === "upi") {
      return await UpiAccount.findByIdAndUpdate(id, data, { new: true });
    }
    return await BankAccount.findOneAndUpdate({ _id: id }, data, {
      new: true,
      runValidators: true,
    });
  }

  // ✅ Get a single Bank or UPI account by userId
  async getByUserId(userId, type) {
    if (type === "upi") {
      return await UpiAccount.find({ UserId: userId });
    }
    return await BankAccount.findOne({ userId });
  }

  // ✅ Get all Bank accounts
  async getAllBankAccounts() {
    return await BankAccount.find({});
  }

  // ✅ Get all UPI accounts
  async getAllUpiAccounts() {
    return await UpiAccount.find({});
  }

  // ✅ Get all Bank & UPI accounts combined
  async getAllAccounts() {
    const bankAccounts = await BankAccount.find({}).lean();
    const upiAccounts = await UpiAccount.find({}).lean();
    return [...bankAccounts, ...upiAccounts]; // ✅ Merge both arrays
  }
}

export default new AccountRepository();
