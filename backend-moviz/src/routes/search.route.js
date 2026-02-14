import { Router } from "express";
import { searchController } from "../controllers/search.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

// Support both GET (preferred) and POST (backwards compat)
router.get("/", asyncHandler(searchController))
router.post("/", asyncHandler(searchController))

export default router;

