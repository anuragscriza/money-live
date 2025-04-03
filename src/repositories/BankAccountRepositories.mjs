import BankAccount from "../models/BankAccountModel.mjs";

class BankAccountRepository {

  async create(data) {
    console.log("Creating Bank Account:", data);
    return await BankAccount.create(data);
  }

  async update(userId, data) {
    return await BankAccount.findOneAndUpdate({ userId }, data, {
      new: true,
      runValidators: true,
    });
  }

  async getByUserId(userId) {
    return await BankAccount.find({ userId }).select("accountId bankName");
  }

  async getAllAccounts() {
    return await BankAccount.find({});
  }

  async getAllAccountsByUserId(userId) { // ✅ Ensure this method exists
    return await BankAccount.find({ userId });
  }

  async getAll() { 
    return await BankAccount.find({}).lean(); // Using `.lean()` for performance optimization
  }
  
  async getBankAccountDetailByBankId(filter) {
    console.log("filter", filter);
    return await BankAccount.findOne(filter).select("bankName accountNumber"); // Use Mongoose findOne()
  }
  // Delete Bank Account by accountId and userId
  async deleteBankAccountByaccountId(userId, accountId) {
    try {
      // Try to delete the bank account matching both userId and accountId
      const result = await BankAccount.deleteOne({ userId, accountId });

      // If no account is found and deleted, return null
      if (result.deletedCount === 0) {
        return null; // No account found to delete
      }

      return { success: true };
    } catch (error) {
      throw new Error("Error deleting bank account: " + error.message);
    }
  }
  }


export default new BankAccountRepository(); // ✅ Ensure this is a default export
