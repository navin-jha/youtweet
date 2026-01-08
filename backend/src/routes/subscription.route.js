import { Router } from "express";

const router = Router();

// importing middlewares
import { verifyJWT } from "../middlewares/index.js";

// importing controllers
import {
  getUserChannelSubscribers,
  getSubscribedChannels,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

// confiuguring jwt middleware for all subscription routes
router.use(verifyJWT);

// declaring routes
router
  .route("/c/:channelId")
  .get(getUserChannelSubscribers)
  .post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
