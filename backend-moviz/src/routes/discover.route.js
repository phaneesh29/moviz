import { Router } from "express";
import { discoverMoviesController, discoverTVController, getGenresController } from "../controllers/discover.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/movies", asyncHandler(discoverMoviesController))
router.get("/tv", asyncHandler(discoverTVController))
router.get("/genres", asyncHandler(getGenresController))

export default router;
