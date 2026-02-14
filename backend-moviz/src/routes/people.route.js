import { Router } from "express";
import { getPeopleController } from "../controllers/people.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/get/:id", asyncHandler(getPeopleController))

export default router;

