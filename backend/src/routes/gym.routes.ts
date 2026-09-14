import { Router } from "express";

import {
  renewMembership,
  freezeMembership,
  resumeMembership,
} from "../controllers/gym.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

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
