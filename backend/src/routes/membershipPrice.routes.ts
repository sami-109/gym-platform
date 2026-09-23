import { Router } from "express";
import {
  getMembershipPrices,
  updateMembershipPrices,
} from "../controllers/membershipPrice.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getMembershipPrices);
router.put("/", authMiddleware, updateMembershipPrices);

export default router;
