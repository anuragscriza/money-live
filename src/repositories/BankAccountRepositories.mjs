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
    return await BankAccount.findOne({ userId });
  }

  async getAllAccounts() {
    return await BankAccount.find({});
  }

  async getAllAccountsByUserId(userId) { // ✅ Ensure this method exists
    return await BankAccount.find({ userId });
  }
}

export default new BankAccountRepository(); // ✅ Ensure this is a default export
