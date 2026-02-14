import { Router } from "express";
import { getCreditController, getLatestController, getMovieController, getRecommendationsController, getVideosController } from "../controllers/movie.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/get/:id", asyncHandler(getMovieController))
router.get("/credits/:id", asyncHandler(getCreditController))
router.get("/recommendations/:id", asyncHandler(getRecommendationsController))
router.get("/videos/:id", asyncHandler(getVideosController))
router.get("/latest", asyncHandler(getLatestController))

export default router;

