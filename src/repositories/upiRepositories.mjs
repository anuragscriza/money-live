import UpiAccount from "../models/upiModel.mjs";

class UpiAccountRepository {
  // Create a new UPI account
  async create(data) {
    return await UpiAccount.create(data);
  }

  // Update UPI account by ID
  async update(id, data) {
    return await UpiAccount.findByIdAndUpdate(id, data, { new: true });
  }

  // Get all UPI accounts
  async getAll() {
    return await UpiAccount.find();
  }

  // Get all UPI accounts for a specific user
  async getByUserId(userId) {
    // Ensure UserId is being queried correctly
    return await UpiAccount.find({ UserId: userId });
  }

  // Get a single UPI account by ID
  async getById(id) {
    return await UpiAccount.findById(id);
  }

  // Delete a UPI account by ID
  async delete(id) {
    return await UpiAccount.findByIdAndDelete(id);
  }
}

export default UpiAccountRepository;
