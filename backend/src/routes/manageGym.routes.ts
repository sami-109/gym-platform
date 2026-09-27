import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createGym,
  getAllGyms,
  editGym,
} from "../controllers/manageGym.controller.js";

const router = Router();

router.post("/", authMiddleware, createGym);
router.get("/view", authMiddleware, getAllGyms);
router.patch("/:gymId", authMiddleware, editGym);

export default router;
