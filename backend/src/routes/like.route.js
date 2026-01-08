import { Router } from "express";

const router = Router();

// importing middlewares
import { verifyJWT } from "../middlewares/index.js";

// configure jwt middleware for all like routes
router.use(verifyJWT);

// importing controllers
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
  getLikedTweets,
} from "../controllers/like.controller.js";

// declaring routes
router.route("/v/:videoId").post(toggleVideoLike);

router.route("/c/:commentId").post(toggleCommentLike);

router.route("/t/:tweetId").post(toggleTweetLike);

router.route("/videos").get(getLikedVideos);

router.route("/tweets").get(getLikedTweets);

export default router;
