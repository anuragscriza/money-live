// import BankAccountRepository from "../repositories/BankAccountRepositories.mjs";

// class BankAccountController {
//   async create(req, res) {
//     try {
//       const { accountNumber, reAccountNumber } = req.body;
//       if (accountNumber !== reAccountNumber) {
//         return res.status(400).json({ error: "Account numbers do not match!" });
//       }

//       const newAccount = await BankAccountRepository.create(req.body);
//       res.status(201).json({
//         message: "Bank Account created successfully",
//         statusCode: 201,
//       });
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }
//   // Get delete Bank Account by ID
//   async delete(req, res) {
//     try {
//       const deletedAccount = await BankAccountRepository.delete(
//         req.user.userId
//       );
//       res.json({ message: "Account deleted successfully", deletedAccount });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }

//   // Get Single Bank Account by User ID
//   async getByUserId(req, res) {
//     try {
//       const { userId } = req.params;
//       const account = await BankAccountRepository.getByUserId(userId);

//       if (!account) {
//         return res.status(404).json({ error: "Bank account not found" });
//       }

//       res.json(account);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }

//   //   // Get All Bank Accounts
//   //   async getAllAccount(req, res) {
//   //     try {
//   //       const accounts = await BankAccountRepository.getAllAccount();
//   //       res.json(accounts);
//   //     } catch (error) {
//   //       res.status(500).json({ error: error.message });
//   //     }
//   //   }
//   // }

//   // Get All Bank Accounts by User ID

//   // async getAllAccount(req, res) {
//   //   try {
//   //     const { userId } = req.user; // Extract userId from token

//   //     if (!userId) {
//   //       return res
//   //         .status(403)
//   //         .json({ error: "Unauthorized: User ID not found in token" });
//   //     }

//   //     const accounts = await BankAccountRepository.getAllAccounts(userId);

//   //     if (!accounts || accounts.length === 0) {
//   //       return res
//   //         .status(404)
//   //         .json({ message: "No accounts found for this user" });
//   //     }

//   //     res.json(accounts);
//   //   } catch (error) {
//   //     res.status(500).json({ error: error.message });
//   //   }
//   // }

//   // Get All Accounts by User ID (Bank or UPI)
//   async getAllAccounts(req, res) {
//     try {
//       const { type } = req.params;
//       let accounts;

//       if (type === "bank") {
//         accounts = await BankAccountRepository.getAllAccounts(req.user.userId);
//       } else if (type === "upi") {
//         accounts = await upiAccountRepo.getAll();
//       } else {
//         return res.status(400).json({ error: "Invalid account type" });
//       }

//       if (!accounts || accounts.length === 0) {
//         return res.status(404).json({ message: "No accounts found" });
//       }

//       res.json(accounts);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// }

// export default new BankAccountController();

import AccountRepository from "../repositories/AccountRepository.mjs";
import BankAccountRepository from "../repositories/BankAccountRepositories.mjs";
import UpiAccountRepository from "../repositories/upiRepositories.mjs";

const upiAccountRepo = new UpiAccountRepository(); // Define UPI repo instance

class BankAccountController {
  async create(req, res) {
    try {
      const { accountNumber, reAccountNumber } = req.body;
      if (accountNumber !== reAccountNumber) {
        return res.status(400).json({ error: "Account numbers do not match!" });
      }
      const userId = req.user.userId;
      const bankData = { ...req.body, userId };
      await BankAccountRepository.create(bankData)
      res.status(201).json({
        message: "Bank Account created successfully",
        statusCode: 201,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  async getAllAccounts(req, res) {
    try {
      const { type } = req.query; // Extract 'type' from URL params
      let accounts;

      if (type === "bank") {
        accounts = await BankAccountRepository.getAll(); // Fetch bank accounts by userId
      } else if (type === "upi") {
        accounts = await upiAccountRepo.getAll(); // Fetch UPI accounts by userId
      } else {
        accounts = await AccountRepository.getAllAccounts(); // If no type is provided, return all accounts
      }

      if (!accounts || accounts.length === 0) {
        return res.status(404).json({ message: "No accounts found" });
      }
      res.status(200).json({
        message: "Bank Account fetch successfully",
        statusCode: 200,
        success: true,
        data: accounts,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  // Get Bank Account by User ID
  // async getBankAccountByUserId(req, res) {
  //   try {
  //     const { userId } = req.params; // Extract userId from URL params
  //     const account = await BankAccountRepository.getByUserId(userId); // Fetch account by userId

  //     if (!account) {
  //       return res.status(404).json({ error: "Bank account not found for this user" });
  //     }

  //     res.status(200).json({
  //       message: "Bank account details fetched successfully",
  //       statusCode: 200,
  //       success: true,
  //       data: account,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // }

  async getBankAccountByUserId(req, res) {
    try {
      const  userId  = req.user.userId; // Extract userId from URL params
      const accounts = await BankAccountRepository.getByUserId(userId); // Fetch account by userId

      if (!accounts) {
        
        return res.status(404).json({ error: "Bank account not found for this user" });
      }

      const userBankAccounts = accounts.map(account => ({
        bankId: account.accountId,
        bankName: account.bankName
      }));

      res.status(200).json({
        message: "Bank account details fetched successfully",
        statusCode: 200,
        success: true,
        data: userBankAccounts,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  // Delete a Bank Account by userId
  // Delete Bank Account by accountId and userId
  async deleteBankAccountByaccountId(req, res) {
    try {
      const userId = req.user.userId; // Extract userId from the authenticated user
      const { accountId } = req.params; // Extract accountId from the request params

      // Call the repository method to delete the bank account by userId and accountId
      const result = await BankAccountRepository.deleteBankAccountByaccountId(userId, accountId);

      // If no account is deleted, handle that case
      if (!result) {
        return res.status(404).json({ error: "Bank account not found or could not be deleted" });
      }

      // Return success response
      return res.status(200).json({
        message: "Bank account deleted successfully",
        success: true
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
  


export default new BankAccountController();
