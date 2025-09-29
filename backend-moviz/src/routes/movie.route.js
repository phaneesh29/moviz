import { Router } from "express";
import { getCreditController, getLatestController, getMovieController, getRecommendationsController } from "../controllers/movie.controller.js";

const router = Router();

router.get("/get/:id", getMovieController)
router.get("/credits/:id", getCreditController)
router.get("/recommendations/:id", getRecommendationsController)
router.get("/latest", getLatestController)

export default router;

