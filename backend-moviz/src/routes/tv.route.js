import { Router } from "express";
import { getCreditController, getEpisodeDetailsController, getLatestController, getRecommendationsController, getSeasonDetailsController, getTvDetailsController } from "../controllers/tv.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/get/:id", asyncHandler(getTvDetailsController))
router.get("/season/:series_id/:season_num", asyncHandler(getSeasonDetailsController))
router.get("/episode/:series_id/:season_num/:episode_num", asyncHandler(getEpisodeDetailsController))
router.get("/credits/:series_id/:season_num/:episode_num", asyncHandler(getCreditController))
router.get("/latest", asyncHandler(getLatestController))
router.get("/recommendations/:id", asyncHandler(getRecommendationsController))


export default router;

