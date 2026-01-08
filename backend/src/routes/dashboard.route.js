import { Router } from "express";

const router = Router();

// importing middlewares
import { verifyJWT } from "../middlewares/index.js";

// configure jwt middleware for all dashboard routes
router.use(verifyJWT);

// importing controllers
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

// declaring routes
router.route("/stats").get(getChannelStats);

router.route("/videos").get(getChannelVideos);

export default router;
