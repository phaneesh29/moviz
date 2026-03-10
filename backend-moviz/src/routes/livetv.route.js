import express from "express";
import { getChannelsController, getChannelController } from "../controllers/livetv.controller.js";

const router = express.Router();

router.get("/channels", getChannelsController);

router.get("/channels/:id", getChannelController);

export default router;
