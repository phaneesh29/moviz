import express from "express";
import {
	getChannelsController,
	getChannelController,
	proxyChannelStreamController,
} from "../controllers/livetv.controller.js";

const router = express.Router();

router.get("/channels", getChannelsController);

router.get("/channels/:id", getChannelController);

router.get("/proxy", proxyChannelStreamController);

export default router;
