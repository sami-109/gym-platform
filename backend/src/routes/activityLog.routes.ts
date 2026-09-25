import { Router } from "express";
import {
  getActivityLogs,
  editActivityLog,
  deleteActivityLog,
} from "../controllers/activityLog.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getActivityLogs);
router.patch("/:id", authMiddleware, editActivityLog);
router.delete("/:id", authMiddleware, deleteActivityLog);

export default router;
