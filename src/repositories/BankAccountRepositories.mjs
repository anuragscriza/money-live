// import BankAccount from "../models/BankAccountModel.mjs";

// class BankAccountRepository {
//   async create(data) {
//     return await BankAccount.create(data);
//   }

//   async update(id, data) {
//     return await BankAccount.findByIdAndUpdate(id, data, { new: true });
//   }
// }

// export default new BankAccountRepository();

import BankAccount from "../models/BankAccountModel.mjs";

class BankAccountRepository {
  async create(data) {
    return await BankAccount.create(data);
  }

  async update(userId, data) {
    return await BankAccount.findOneAndUpdate({ userId }, data, {
      new: true,
    });
  }

  async getById(userId) {
    return await BankAccount.findOne({ userId });
  }

  async getAll() {
    return await BankAccount.find({ userId });
  }
}

export default new BankAccountRepository();
