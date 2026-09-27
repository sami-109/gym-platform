import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  connectAdminToGym,
  disconnectAdminFromGym,
} from "../controllers/adminGym.controller.js";

const router = Router();

router.patch("/:gymId/admin/:adminId", authMiddleware, connectAdminToGym);
router.patch("/:adminId/disconnect", authMiddleware, disconnectAdminFromGym);

export default router;
