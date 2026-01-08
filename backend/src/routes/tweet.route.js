import { Router } from "express";

const router = Router();

// importing middlewares
import { validate, verifyJWT } from "../middlewares/index.js";

// importing validators
import {
  createTweetValidator,
  updateTweetValidator,
} from "../validators/tweet.validator.js";

// configure jwt middleware for all tweet routes
router.use(verifyJWT);

// importing controllers
import {
  getUserTweets,
  createTweet,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";

// declaring routes
router.route("/user/:userId").get(getUserTweets);

router.route("/").post(createTweetValidator(), validate, createTweet);

router
  .route("/:tweetId")
  .patch(updateTweetValidator(), validate, updateTweet)
  .delete(deleteTweet);

export default router;
