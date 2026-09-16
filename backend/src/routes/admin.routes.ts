import { Router } from "express";

import {
  createAdmin,
  getAllAdmins,
  disconnectAdminFromGym,
  editAdmin,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/create", authMiddleware, createAdmin);
router.get("/view", authMiddleware, getAllAdmins);
router.patch("/:adminId/disconnect", authMiddleware, disconnectAdminFromGym);
router.patch("/:adminId", authMiddleware, editAdmin);

export default router;
