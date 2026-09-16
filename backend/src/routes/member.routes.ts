import { Router } from "express";

import { createMember } from "../controllers/member.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/create", authMiddleware, createMember);

export default router;
