import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  login,
  getMe,
  setupSuperAdmin,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);

router.get("/me", authMiddleware, getMe);

router.post("/setup-super-admin", setupSuperAdmin);

export default router;
