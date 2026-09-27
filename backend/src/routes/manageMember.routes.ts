import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createMember,
  getMembers,
  editMember,
  retrieveCredentials,
  deleteMember,
} from "../controllers/manageMember.controller.js";

const router = Router();

router.post("/create", authMiddleware, createMember);
router.get("/view", authMiddleware, getMembers);
router.patch("/:memberId", authMiddleware, editMember);

router.post(
  "/:memberId/retrieve-credentials",
  authMiddleware,
  retrieveCredentials,
);

router.delete("/:memberId", authMiddleware, deleteMember);

export default router;
