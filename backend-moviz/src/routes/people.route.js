import { Router } from "express";
import { getPeopleController, getPeopleCreditsController } from "../controllers/people.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/get/:id", asyncHandler(getPeopleController))
router.get("/credits/:id", asyncHandler(getPeopleCreditsController))

export default router;

