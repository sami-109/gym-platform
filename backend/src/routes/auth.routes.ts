import { Router } from "express";

import {
  loginMember,
  getMe,
  setupSuperAdmin,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", loginMember);

router.get("/me", authMiddleware, getMe);

router.post("/setup-super-admin", setupSuperAdmin);

export default router;
