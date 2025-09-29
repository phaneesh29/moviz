import { Router } from "express";
import { getPeopleController } from "../controllers/people.controller.js";

const router = Router();

router.get("/get/:id", getPeopleController)

export default router;

