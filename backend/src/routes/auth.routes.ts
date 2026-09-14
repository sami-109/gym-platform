import { Router } from "express";

import {
  loginMember,
  getMe,
  registerAdmin,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", loginMember);

router.get("/me", authMiddleware, getMe);
router.post("/admin/register", registerAdmin);

export default router;
