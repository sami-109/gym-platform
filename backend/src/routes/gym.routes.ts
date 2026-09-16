import { Router } from "express";

import {
  createGym,
  renewMembership,
  freezeMembership,
  resumeMembership,
  connectAdminToGym,
  getAllGyms,
  editGym,
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

router.patch("/:gymId/admin/:adminId", authMiddleware, connectAdminToGym);

router.patch("/:gymId", authMiddleware, editGym);

router.get("/view", authMiddleware, getAllGyms);

export default router;
