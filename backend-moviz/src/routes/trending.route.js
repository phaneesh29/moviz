import { Router } from "express";
import { getTrendingMoviesController, getTrendingTVController } from "../controllers/trending.controller.js";

const router = Router();

router.get("/movies", getTrendingMoviesController)
router.get("/tv", getTrendingTVController)

export default router;

