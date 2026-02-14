import { Router } from "express";
import { getTrendingMoviesController, getTrendingTVController } from "../controllers/trending.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/movies", asyncHandler(getTrendingMoviesController))
router.get("/tv", asyncHandler(getTrendingTVController))

export default router;

