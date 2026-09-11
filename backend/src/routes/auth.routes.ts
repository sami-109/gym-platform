import { Router } from "express";

import {
  registerMember,
  loginMember,
  getMe,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerMember);
router.post("/login", loginMember);

router.get("/me", authMiddleware, getMe);

export default router;
