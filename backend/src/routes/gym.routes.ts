import { Router } from "express";

import {
  createGym,
  renewMembership,
  freezeMembership,
  resumeMembership,
} from "../controllers/gym.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createGym);

router.patch(
  "/:gymId/memberships/:membershipId/renew",
  authMiddleware,
  renewMembership,
);
router.patch(
  "/:gymId/memberships/:membershipId/freeze",
  authMiddleware,
  freezeMembership,
);
router.patch(
  "/:gymId/memberships/:membershipId/resume",
  authMiddleware,
  resumeMembership,
);

export default router;
