import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getMembershipPrices,
  updateMembershipPrices,
} from "../controllers/membershipPrice.controller.js";

const router = Router();

router.get("/", authMiddleware, getMembershipPrices);
router.put("/", authMiddleware, updateMembershipPrices);

export default router;
