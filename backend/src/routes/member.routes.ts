import { Router } from "express";

import {
  createMember,
  getMembers,
  getMyMembership,
  deactivateMember,
  activateMember,
  editMember,
  retrieveCredentials,
} from "../controllers/member.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/create", authMiddleware, createMember);

router.get("/view", authMiddleware, getMembers);

router.get("/me/membership", authMiddleware, getMyMembership);

router.patch("/:memberId/deactivate", authMiddleware, deactivateMember);

router.patch("/:memberId/activate", authMiddleware, activateMember);

router.patch("/:memberId", authMiddleware, editMember);

router.post(
  "/:memberId/retrieve-credentials",
  authMiddleware,
  retrieveCredentials,
);

export default router;
