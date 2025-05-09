import { Router } from "express";
import { getCreditController, getMovieController } from "../controllers/movie.controller.js";

const router = Router();

router.get("/get/:id", getMovieController)
router.get("/credits/:id", getCreditController)
router.get("/similar/:id", getCreditController)

export default router;

