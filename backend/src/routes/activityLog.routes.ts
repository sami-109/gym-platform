import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getActivityLogs,
  editActivityLog,
  deleteActivityLog,
} from "../controllers/activityLog.controller.js";

const router = Router();

router.get("/", authMiddleware, getActivityLogs);
router.patch("/:id", authMiddleware, editActivityLog);
router.delete("/:id", authMiddleware, deleteActivityLog);

export default router;
