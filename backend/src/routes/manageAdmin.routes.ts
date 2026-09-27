import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createAdmin,
  getAllAdmins,
  editAdmin,
} from "../controllers/manageAdmin.controller.js";

const router = Router();

router.post("/create", authMiddleware, createAdmin);
router.get("/view", authMiddleware, getAllAdmins);
router.patch("/:adminId", authMiddleware, editAdmin);

export default router;
