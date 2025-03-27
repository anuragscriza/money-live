import UpiAccountRepository from "../repositories/upiRepositories.mjs";

const upiAccountRepo = new UpiAccountRepository();

class UpiAccountController {
  // Create UPI Account
  async create(req, res) {
    try {
      const newAccount = await upiAccountRepo.create(req.body);
      res.status(200).json({
        statusCode: 201,
        success: true,
        message: "Upi Account created succssfully",
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update UPI Account
  async update(req, res) {
    try {
      const updatedAccount = await upiAccountRepo.update(
        req.params.id,
        req.body
      );
      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get All UPI Accounts
  async getAll(req, res) {
    try {
      const accounts = await upiAccountRepo.getAll();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get UPI Accounts by User ID
  async getByUserId(req, res) {
    try {
      // Fetch the account from the repository
      const account = await upiAccountRepo.getByUserId(req.params.UserId);
      console.log("Fetched account:", account); // Log the account for debugging

      // Check if account exists
      if (!account || account.length === 0) {
        return res.status(404).json({ error: "UPI account not found" });
      }

      // Send the account as a JSON response
      res.json(account);
    } catch (error) {
      console.error("Error fetching UPI account:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get Single UPI Account by ID
  async getById(req, res) {
    try {
      const account = await upiAccountRepo.getById(req.params.id);
      if (!account) {
        return res.status(404).json({ error: "UPI account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete UPI Account
  async delete(req, res) {
    try {
      const account = await upiAccountRepo.getById(req.params.id);
      if (!account) {
        return res.status(404).json({ error: "UPI account not found" });
      }
      await upiAccountRepo.delete(req.params.id);
      res.status(204).send({ message: "UPI account deleted successfully" }); // No content to return after deletion
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UpiAccountController();
