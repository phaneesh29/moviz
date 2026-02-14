import { Router } from "express";
import { feedbackController } from "../controllers/feedback.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(feedbackController));

export default router;
