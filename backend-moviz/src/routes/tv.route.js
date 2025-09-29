import { Router } from "express";
import { getCreditController, getEpisodeDetailsController, getLatestController, getRecommendationsController, getSeasonDetailsController, getTvDetailsController } from "../controllers/tv.controller.js";

const router = Router();

router.get("/get/:id", getTvDetailsController)
router.get("/season/:series_id/:season_num", getSeasonDetailsController)
router.get("/episode/:series_id/:season_num/:episode_num", getEpisodeDetailsController)
router.get("/credits/:series_id/:season_num/:episode_num", getCreditController)
router.get("/latest", getLatestController)
router.get("/recommendations/:id", getRecommendationsController)


export default router;

