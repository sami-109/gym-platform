import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getTransactions,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();

router.get("/", authMiddleware, getTransactions);
router.delete("/:transactionId", authMiddleware, deleteTransaction);
router.put("/:transactionId", authMiddleware, updateTransaction);

export default router;
