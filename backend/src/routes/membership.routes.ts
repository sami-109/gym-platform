import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getMyMembership,
  activateMember,
  deactivateMember,
  renewMembership,
  freezeMembership,
  resumeMembership,
  adjustMembershipDates,
  addDayPass,
} from "../controllers/membership.controller.js";

const router = Router();

router.get("/me", authMiddleware, getMyMembership);

router.patch("/:memberId/activate", authMiddleware, activateMember);
router.patch("/:memberId/deactivate", authMiddleware, deactivateMember);

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

router.patch(
  "/:gymId/memberships/:membershipId/dates",
  authMiddleware,
  adjustMembershipDates,
);

router.patch(
  "/:gymId/memberships/:membershipId/day-pass",
  authMiddleware,
  addDayPass,
);

export default router;
