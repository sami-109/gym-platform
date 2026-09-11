import { Router } from "express";

import {
  createGym,
  getGyms,
  applyToGym,
  getPendingMemberships,
  approveMembership,
  renewMembership,
  getMyMemberships,
  freezeMembership,
  resumeMembership,
} from "../controllers/gym.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createGym);
router.get("/", getGyms);
router.post("/:gymId/apply", authMiddleware, applyToGym);
router.get(
  "/:gymId/memberships/pending",
  authMiddleware,
  getPendingMemberships,
);
router.patch(
  "/:gymId/memberships/:membershipId/approve",
  authMiddleware,
  approveMembership,
);
router.patch(
  "/:gymId/memberships/:membershipId/renew",
  authMiddleware,
  renewMembership,
);
router.get("/memberships/me", authMiddleware, getMyMemberships);
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
