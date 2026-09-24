import { Router } from "express";
import {
  getTransactions,
  deleteTransaction,
  updateTransaction,
} from "../controllers/Transaction.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getTransactions);
router.delete("/:transactionId", authMiddleware, deleteTransaction);
router.put("/:transactionId", authMiddleware, updateTransaction);

export default router;
