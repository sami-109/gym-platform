import { Router } from "express";

import { createAdmin, getAllAdmins } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/create", authMiddleware, createAdmin);
router.get("/view", authMiddleware, getAllAdmins);

export default router;
