import BankAccountRepository from "../repositories/BankAccountRepositories.mjs";

class BankAccountController {
  async create(req, res) {
    try {
      const { accountNumber, reAccountNumber } = req.body;
      if (accountNumber !== reAccountNumber) {
        return res.status(400).json({ error: "Account numbers do not match!" });
      }

      const newAccount = await BankAccountRepository.create(req.body.userId);
      res.statusCode(201).json({
        message: "Bank Account created successfully",
        statusCode: 201,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  // Get Update Bank Account by ID
  async update(req, res) {
    try {
      const updatedAccount = await BankAccountRepository.update(
        req.user.userId,
        req.body
      );
      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
 
  // Get Single Bank Account by User ID
async getByUserId(req, res) {
  try {
    const { userId } = req.params;
    const account = await BankAccountRepository.getByUserId(userId);
    
    if (!account) {
      return res.status(404).json({ error: "Bank account not found" });
    }
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

  // Get All Bank Accounts
  async getAllAccount(req, res) {
    try {
      const accounts = await BankAccountRepository.getAllAccount();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new BankAccountController();
